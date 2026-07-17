import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('data');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {}
}

class JsonCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
  }

  async read() {
    await ensureDir(DATA_DIR);
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  async write(data) {
    await ensureDir(DATA_DIR);
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async find(query = {}) {
    let items = await this.read();
    let filtered = items.filter(item => this._matches(item, query));
    return {
      sort: (sortObj) => {
        const key = Object.keys(sortObj)[0];
        if (!key) return filtered;
        const direction = sortObj[key];
        return filtered.sort((a, b) => {
          if (a[key] < b[key]) return direction === -1 ? 1 : -1;
          if (a[key] > b[key]) return direction === -1 ? -1 : 1;
          return 0;
        });
      },
      ...filtered,
      [Symbol.iterator]: function* () {
        for (const item of filtered) {
          yield item;
        }
      },
      map: (fn) => filtered.map(fn),
      filter: (fn) => filtered.filter(fn),
      length: filtered.length
    };
  }

  async findOne(query = {}) {
    const items = await this.read();
    return items.find(item => this._matches(item, query)) || null;
  }

  async findById(id) {
    const items = await this.read();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    const items = await this.read();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    await this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const items = await this.read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const updatedFields = typeof update.$set === 'object' ? update.$set : update;
    items[index] = {
      ...items[index],
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    await this.write(items);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const items = await this.read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    await this.write(items);
    return deleted;
  }

  async updateOne(query, update) {
    const items = await this.read();
    const index = items.findIndex(item => this._matches(item, query));
    if (index === -1) return null;
    const updatedFields = typeof update.$set === 'object' ? update.$set : update;
    items[index] = {
      ...items[index],
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    await this.write(items);
    return items[index];
  }

  async deleteOne(query) {
    const items = await this.read();
    const index = items.findIndex(item => this._matches(item, query));
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    await this.write(items);
    return deleted;
  }

  async countDocuments(query = {}) {
    const items = await this.read();
    return items.filter(item => this._matches(item, query)).length;
  }

  _matches(item, query) {
    for (const key in query) {
      const val = query[key];
      if (typeof val === 'object' && val !== null) {
        if ('$regex' in val) {
          const regex = new RegExp(val.$regex, val.$options || '');
          if (!regex.test(item[key] || '')) return false;
        } else if ('$in' in val) {
          if (!val.$in.includes(item[key])) return false;
        } else {
          if (JSON.stringify(item[key]) !== JSON.stringify(val)) return false;
        }
      } else {
        if (item[key] !== val) return false;
      }
    }
    return true;
  }
}

export const getCollection = (name) => new JsonCollection(name);
