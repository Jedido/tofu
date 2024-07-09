class TrieNode {
  constructor() {
      this.children = {};
      this.word = "";
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Insert a word into the trie
  insert(word) {
      let node = this.root;
      for (let char of word) {
          if (!node.children[char]) {
              node.children[char] = new TrieNode();
          }
          node = node.children[char];
      }
      node.word = word;
  }

  // Search for a word in the trie
  search(word) {
      let node = this.root;
      for (let char of word) {
          if (!node.children[char]) {
              return false;
          }
          node = node.children[char];
      }
      return !!node.word;
  }

  // Check if there is any word in the trie that starts with the given prefix
  getPrefix(prefix) {
      let node = this.root;
      for (let char of prefix) {
          if (!node.children[char]) {
              return null;
          }
          node = node.children[char];
      }
      return node;
  }
}

module.exports = Trie