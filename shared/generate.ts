/**
 * Usage:
 *   bun shared/generate.ts         → regenerate all bases + registry
 *   bun shared/generate.ts <name>  → regenerate base + scaffold service (if missing)
 *
 * To regenerate a service stub, delete the file first — it won't be overwritten.
 */
import { Project, SyntaxKind, VariableDeclarationKind } from "ts-morph"
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { resolve } from "path"

const SPECS_DIR = resolve(import.meta.dir, "specs")
const SERVICES_DIR = resolve(import.meta.dir, "..", "server", "services")
const REGISTRY_FILE = resolve(import.meta.dir, "..", "server", "registry.ts")

// ── Interfaces ───────────────────────────────────────────────────────────────
interface TypeDecl {
  name: string
  initText: string
}
interface Entry {
  key: string // action/event key without service prefix, e.g. "send-message"
  typeName: string // name of the DataType const, e.g. "SendMessageData"
  constName: string // name of the Action/Message const, e.g. "SendMessageAction"
}
interface SpecInfo {
  serviceName: string
  types: TypeDecl[]
  actions: Entry[]
  events: Entry[]
}

// ── Naming helpers ───────────────────────────────────────────────────────────
function toPascalCase(s: string) {
  return s
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("")
}
function toCamelCase(s: string) {
  const parts = s.split("-")
  return (
    parts[0] +
    parts
      .slice(1)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join("")
  )
}

// "receive-message" → "sendReceiveMessage"
function eventSendMethodName(key: string) {
  return "send" + toPascalCase(key)
}

// "example" → "exampleServiceBase.ts"
function baseFileName(serviceName: string) {
  return toCamelCase(serviceName) + "ServiceBase.ts"
}

// ── Parse spec (static analysis via ts-morph) ────────────────────────────────
export function parseSpec(specPath: string): SpecInfo {
  const project = new Project({ skipAddingFilesFromTsConfig: true })
  const file = project.addSourceFileAtPath(specPath)

  const serviceName = file
    .getVariableDeclaration("serviceName")
    ?.getInitializerIfKind(SyntaxKind.StringLiteral)
    ?.getLiteralValue()
  if (!serviceName) throw new Error(`serviceName not found in ${specPath}`)

  // Exported consts annotated `: DataType`
  const types: TypeDecl[] = file
    .getVariableStatements()
    .filter((s) => s.hasExportKeyword())
    .flatMap((s) => s.getDeclarations())
    .filter((d) => d.getTypeNode()?.getText() === "DataType")
    .map((d) => ({
      name: d.getName(),
      initText: d.getInitializerOrThrow().getText(),
    }))

  // Exported consts annotated `: Action` or `: Message`
  function readEntries(
    annotation: "Action" | "Message",
    keyProp: "action" | "event"
  ): Entry[] {
    return file
      .getVariableStatements()
      .filter((s) => s.hasExportKeyword())
      .flatMap((s) => s.getDeclarations())
      .filter((d) => d.getTypeNode()?.getText() === annotation)
      .map((d) => {
        const obj = d.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)
        if (!obj)
          throw new Error(
            `${d.getName()} must be initialized with an object literal`
          )
        const keyPa = obj
          .getProperty(keyProp)
          ?.asKindOrThrow(SyntaxKind.PropertyAssignment)
        const dataPa = obj
          .getProperty("data")
          ?.asKindOrThrow(SyntaxKind.PropertyAssignment)
        const key = keyPa
          ?.getInitializerOrThrow()
          .asKindOrThrow(SyntaxKind.StringLiteral)
          .getLiteralValue()
        const typeName = dataPa?.getInitializerOrThrow().getText()
        const constName = d.getName()
        if (!key || !typeName)
          throw new Error(`${constName} is missing '${keyProp}' or 'data'`)
        return { key, typeName, constName }
      })
  }

  return {
    serviceName,
    types,
    actions: readEntries("Action", "action"),
    events: readEntries("Message", "event"),
  }
}

// ── Generate base file ───────────────────────────────────────────────────────
export function generateBase(spec: SpecInfo, specName: string): string {
  const { serviceName, types, actions, events } = spec
  const className = toPascalCase(serviceName) + "ServiceBase"

  const project = new Project({ useInMemoryFileSystem: true })
  const file = project.createSourceFile("out.ts", "")

  file.addImportDeclaration({ moduleSpecifier: "zod", namedImports: ["z"] })
  file.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: "../../utils/tsocket.ts",
    namedImports: ["TSocket"],
  })
  file.addExportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: "../../utils/tsocket.ts",
    namedExports: [{ name: "TSocket" }],
  })
  file.addImportDeclaration({
    defaultImport: "GameService",
    moduleSpecifier: "../gameService.ts",
  })

  for (const { name, initText } of types) {
    file.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name, initializer: initText }],
    })
    file.addTypeAlias({
      isExported: true,
      name,
      type: `z.infer<typeof ${name}>`,
    })
  }

  const actionEntries = actions.map((a) => ({
    ...a,
    fullKey: `${serviceName}-${a.key}`,
    methodName: a.constName.charAt(0).toLowerCase() + a.constName.slice(1),
  }))
  const eventEntries = events.map((e) => ({
    ...e,
    sendMethodName: eventSendMethodName(e.key),
    emitKey: `${serviceName}-${e.key}`,
  }))

  const klass = file.addClass({
    name: className,
    isAbstract: true,
    isExported: true,
    extends: "GameService",
  })

  const switchBody = actionEntries.length
    ? `switch (action) {\n${actionEntries.map((a) => `      case "${a.fullKey}": this.${a.methodName}(this.parseDataAs(${a.typeName}, data), socket); break`).join("\n")}\n    }`
    : ""
  klass.addMethod({
    name: "dispatch",
    hasOverrideKeyword: true,
    parameters: [
      { name: "action", type: "string" },
      { name: "data", type: "unknown" },
      { name: "socket", type: "TSocket" },
    ],
    returnType: "void",
    statements: switchBody ? [switchBody] : [],
  })

  for (const a of actionEntries) {
    klass.addMethod({
      name: a.methodName,
      isAbstract: true,
      parameters: [
        { name: "data", type: a.typeName },
        { name: "sender", type: "TSocket" },
      ],
      returnType: "void",
    })
  }

  for (const e of eventEntries) {
    klass.addMethod({
      name: e.sendMethodName,
      parameters: [
        { name: "data", type: e.typeName },
        { name: "recipient", type: "TSocket", hasQuestionToken: true },
      ],
      returnType: "void",
      statements: [`this.send("${e.emitKey}", data, recipient)`],
    })
  }

  file.addStatements(`${className}.prototype.id = "${serviceName}"`)

  file.formatText({ indentSize: 2, tabSize: 2 })

  const header =
    `/* eslint-disable */\n` +
    `// AUTO-GENERATED from shared/specs/${specName}Spec.ts — do not edit.\n` +
    `// Run \`npm run generate -- ${serviceName}\` to regenerate.\n`
  return header + file.getFullText()
}

// ── Process one spec (parse once, generate base + scaffold service) ──────────
function processSpec(spec: SpecInfo, specName: string) {
  const { serviceName, actions } = spec

  const serviceDir = resolve(SERVICES_DIR, toCamelCase(serviceName))
  mkdirSync(serviceDir, { recursive: true })

  const outPath = resolve(serviceDir, baseFileName(serviceName))
  writeFileSync(outPath, generateBase(spec, specName))
  console.log(`Generated ${outPath}`)

  const serviceFile = resolve(
    serviceDir,
    toCamelCase(serviceName) + "Service.ts"
  )
  if (existsSync(serviceFile)) {
    console.log(`${serviceFile} already exists — skipping (delete it to regenerate)`)
    return
  }
  const className = toPascalCase(serviceName) + "ServiceBase"
  const typeImportParts = [...new Set(actions.map((a) => a.typeName))].map(
    (t) => `type ${t}`
  )
  if (actions.length > 0) typeImportParts.push("type TSocket")
  const allImports = [className, ...typeImportParts].join(", ")
  const stubs = actions
    .map((a) => {
      const method = a.constName.charAt(0).toLowerCase() + a.constName.slice(1)
      return `  ${method}(data: ${a.typeName}, sender: TSocket) {\n    // TODO\n  }`
    })
    .join("\n\n")
  writeFileSync(
    serviceFile,
    `import { ${allImports} } from "./${baseFileName(serviceName)}"\n` +
      `\nexport default class extends ${className} {\n${stubs}\n}\n`
  )
  console.log(`Created ${serviceFile}`)
}

// ── Regenerate registry (filesystem scan, no spec parsing) ───────────────────
export function regenerateRegistry() {
  const services = readdirSync(SERVICES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((dir) => {
      const baseName = dir.name
      const baseFile = resolve(
        SERVICES_DIR,
        baseName,
        `${baseName}ServiceBase.ts`
      )
      const serviceFile = resolve(
        SERVICES_DIR,
        baseName,
        `${baseName}Service.ts`
      )
      if (!existsSync(baseFile) || !existsSync(serviceFile)) return []
      const baseContent = readFileSync(baseFile, "utf-8")
      const idMatch = baseContent.match(/\.prototype\.id = "([^"]+)"/)
      const serviceId = idMatch ? idMatch[1] : baseName
      return [
        {
          importName:
            baseName.charAt(0).toUpperCase() + baseName.slice(1) + "Service",
          fileName: `${baseName}/${baseName}Service.ts`,
          serviceId,
        },
      ]
    })

  const imports = services
    .map((s) => `import ${s.importName} from "./services/${s.fileName}"`)
    .join("\n")
  const entries = services.map((s) => `  "${s.serviceId}": ${s.importName},`).join("\n")
  writeFileSync(
    REGISTRY_FILE,
    `/* eslint-disable */\n// AUTO-GENERATED — do not edit manually.\n// Run \`npm run generate\` to rebuild.\nimport type GameService from "./services/gameService.ts"\n${imports}\n\ntype GameServiceConstructor = new (roomId: string) => GameService\n\nexport const games: Record<string, GameServiceConstructor> = {\n${entries}\n}\n`
  )
  console.log(
    `Registry: ${services.length} service(s) — ${services.map((s) => s.importName).join(", ")}`
  )
}

// ── Main entry point ─────────────────────────────────────────────────────────
export function generate(serviceArg?: string) {
  const specFiles = serviceArg
    ? [`${serviceArg}Spec.ts`]
    : readdirSync(SPECS_DIR).filter((f) => f.endsWith("Spec.ts"))

  for (const file of specFiles) {
    const specPath = resolve(SPECS_DIR, file)
    if (!existsSync(specPath)) {
      console.error(`Spec not found: ${specPath}`)
      console.error(`Create shared/specs/${file} first.`)
      process.exit(1)
    }
    const specName = file.replace("Spec.ts", "")
    let spec: SpecInfo
    try {
      spec = parseSpec(specPath)
    } catch (e) {
      console.warn(`Skipping ${file}: ${e}`)
      continue
    }
    processSpec(spec, specName)
  }

  regenerateRegistry()
}

if (import.meta.main) {
  const [, , serviceArg] = process.argv
  generate(serviceArg)
}
