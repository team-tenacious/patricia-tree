module.exports = class Tree {
    constructor(items) {
        this.tree = {};
        this.initialize(items);
    }

    initialize (items){
        items = items || {};
        
        Object.keys(items).forEach(function(key) {
            self.insert(key, items[key]);
        });
    }

    static create(items) {
        return new Tree(items);
    }

    insert (key, value, tree) {

        if (key === '$value') throw new Error(`$value is a reserved key`);

        let l = key.length;
        let prefix;
        tree = tree || this.tree;

        // Search for existing prefixes
        while (l--) {
            prefix = key.substr(0, l+1);
            if (tree[prefix]) {
                // Found prefix, moving into subtrie
                if (!Object.keys(tree[prefix]).length) {
                    // If one word is a pure subset of another word, the prefix 
                    // should also point to the subset.
                    tree[prefix][""] = {};
                }
                return this.insert(key.substr(l+1), value, tree[prefix]);
            }
        }

        // No prefix found means insert word and check for prefix collision
        const siblings = Object.keys(tree).filter(key => {
            return key !== '$value';
        });

        l = key.length;

        const siblingFound = siblings.some((sibling) => {
            let s = 0;
            let commonPrefix;
            
            do {
                if (sibling[s] != key[s]) {
                    if (s > 1) {
                        commonPrefix = sibling.substr(0, s-1);
                    }
                    break;
                }
            } while (s++ < l)
            
            if (commonPrefix) {
                // Rearrange trie to move word with prefix collision into new 
                // common prefix subtrie
                tree[commonPrefix] = {};
                this.insert(sibling.substr(s-1), value, tree[commonPrefix]);
                tree[commonPrefix][sibling.substr(s-1)] = tree[sibling];
                this.insert(key.substr(s-1), value, tree[commonPrefix]);
                delete tree[sibling];
                return true;
            }
        });
        // No siblings at this level? New branch.
        if (!siblingFound) tree[key] = { $value : value };
    }

    lookup (key, tree, matchedPrefix) {
        tree = tree || this.tree;
        matchedPrefix = matchedPrefix || "";
        let l = key.length;
        let matches = [];
        
        // Search for existing prefixes and recursively descend
        while (l--) {
            const prefix = key.substr(0, l+1);
            if (tree[prefix]) {
                const suffix = key.substr(l+1);
                return this.lookup(suffix, tree[prefix], matchedPrefix + prefix);
            }
        }
        
        // No prefixes means check siblings on this level
        l = key.length;
        const siblings = Object.keys(tree).filter(key => {
            return key !== '$value';
        });
        siblings.some((sibling) => {
            let s = l;
            // Node parent is full word, so include all children as matches
            if (!s) {
                matches = matches.concat(this.values(tree[sibling], matchedPrefix + sibling));
            }
            // Check all child prefixes for matches
            while (s--) {
                if (sibling.substr(0, s+1) === key.substr(0, s+1)) {
                    matches = matches.concat(this.values(tree[sibling], matchedPrefix + sibling));
                    return true;
                }
            }
        });
        
        // Match complete word that has no children
        if (!siblings.length && !key.length) {
            matches.push(tree.$value);
        }
        
        return matches;
    }

    values (tree, matchedPrefix) {
        tree = tree || this.tree;
        const keys = Object.keys(tree).filter(key => {
            return key !== '$value';
        });
        let matches = [];
        matchedPrefix = matchedPrefix || "";
        // Recursively descend down to fetch all words
        if (keys.length) {
            keys.some(key => {
                if (Object.keys(tree[key]).length) {
                    matches = matches.concat(this.values(tree[key], matchedPrefix + key));
                    return;
                } 
                if (tree[key].$value) matches.push(tree[key].$value);
            });
        } else {
            // No children, so just include self
            if (tree.$value) matches.push(tree.$value);
        }
        return matches;
    }
}