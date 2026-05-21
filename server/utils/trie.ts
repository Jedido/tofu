export class TrieNode {
  children: Record<string, TrieNode>
  word: string

  constructor() {
    this.children = {}
    this.word = ""
  }
}

export class Trie {
  root: TrieNode

  constructor() {
    this.root = new TrieNode()
  }

  // Insert a word into the trie
  insert(word: string) {
    let node = this.root
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode()
      }
      node = node.children[char]
    }
    node.word = word
  }

  // Search for a word in the trie
  search(word: string): boolean {
    let node = this.root
    for (const char of word) {
      if (!node.children[char]) {
        return false
      }
      node = node.children[char]
    }
    return !!node.word
  }

  // Check if there is any word in the trie that starts with the given prefix
  getPrefix(prefix: string): TrieNode | null {
    let node = this.root
    for (const char of prefix) {
      if (!node.children[char]) {
        return null
      }
      node = node.children[char]
    }
    return node
  }
}
