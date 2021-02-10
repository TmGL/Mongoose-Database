const mongoose = require('mongoose');
const schema = require('./schema');
const chalk = require('chalk');

class DataBase {
    /**
     * Connects your mongo database.
     * 
     * @param {String} uri
     * @example
     * const { DataBase } = require('DataBase');
     * const db = new DataBase('mongo uri'); 
     */
    constructor(uri) {
        if (!uri) throw new Error('No uri was provided');
        mongoose
            .connect(uri, { useFindAndModify: true, useUnifiedTopology: true, useNewUrlParser: true })
            .then(() => console.log(chalk.green('Successfully connected to database!')))
            .catch(err => console.error(err));
    }

    /**
    * Sets a key with a value. 
    * 
    * @param {String} key 
    * @param {*} value 
    * @returns {String}
    * @example
    * db.set('Hello', 'world!'); // set's the key with the value
    */
    async set(key, value) {
        if (!key) throw new Error('A key must be provided');
        if (!value) throw new Error('A value must be provided');
        if (typeof key !== 'string') throw new Error('Type of key must be a string');

        await schema.findOne({
            key: key
        }, async (err, data) => {
            if (err) throw err;

            if (data) {
                data.value = value;
                await data.save();
                return;
            } else {
                await new schema({
                    key: key,
                    value: value
                }).save();
            }
        });
    }

    /**
     * Returns the value of a specified key, returns undefined if key doesn't exist.
     * 
     * @param {String} key 
     * @returns {Promise}
     * @example
     * await db.get('key'); // get's the value of the key, or undefined
     */
    async get(key) {
        if (!key) throw new Error('No key was provided');
        if (typeof key !== 'string') throw new Error('Type of key must be a string');

        const data = await schema.findOne({
            key: key
        });

        return data ? data.value : undefined;
    }

    /**
     * Checks if a key exists in the database.
     * 
     * @param {String} key
     * @returns {Promise}
     * @example
     * await db.has('key') // returns true if data is found, otherwise returns false 
     */
    async has(key) {
        let has;

        if (!key) throw new Error(
            'No key was provided'
        );

        await schema.findOne({
            key: key
        }, async (err, data) => {
            if (err) throw err;

            data ? has = true : has = false;
        });

        return has;
    }

    /**
     * Delete's the specified key.
     * 
     * @param {String} key 
     * @throws throws ReferenceError if key was not found
     * @example 
     * db.delete('key'); // deletes data or throws error if it doesn't exist
     */
    async delete(key) {
        if (!key) throw new Error('No key was provided');
        if (typeof key !== 'string') throw new Error('Type of key must be a string');

        await schema.findOne({
            key: key
        }, async (err, data) => {
            if (err) throw err;

            if (data) {
                return data.delete();
            } else {
                throw new Error(
                    'Could not find data with the specified key'
                );
            }
        });
    }

    /**
     * Pushes an element into an existing array, or makes on if there is none.
     * 
     * @param {String} name 
     * @param {*} element 
     * @example
     * db.push('array', 'element'); // pushes element into key, or creates one with that key if it doesn't exist
     */
    async push(key, element) {
        if (!key) throw new Error('No key was provided');
        if (!element) throw new Error('No element was provided');
        if (typeof key !== 'string') throw new Error('Type of name must be a string');

        const data = await schema.findOne({
            key: key
        });

        if (data) {
            if (!Array.isArray(data.value)) throw new Error(
                'The specified key does not return an array'
            );

            await schema.findOneAndUpdate({
                key: key,
            }, {
                key: key,
                $push: {
                    value: element
                }
            });
        } else {
            await new schema({
                key: key,
                value: [element]
            }).save();
        }
    }

    /**
     * Removes an element from an array. If you set multi to fale, it will only remove the first element that you provide.
     * 
     * @param {String} key 
     * @param {*} element
     * @throws throws ReferenceError if key was not found
     * @example
     * db.pull('array', 'element'); // pulls all elements from that array, or throws error if key doesn't exist
     */
    async pull(key, element) {
        if (!key) throw new Error('No key was provided');
        if (!element) throw new Error('No element was provided');
        if (typeof key !== 'string') throw new Error('Type of name must be a string');

        const data = await schema.findOne({
            key: key
        });

        if (data) {
            if (!Array.isArray(data.value)) throw new Error(
                'The specified key does not return an array'
            );

            await schema.findOneAndUpdate({
                key: key
            }, {
                key: key,
                $pull: {
                    value: element
                }
            });
        } else {
            throw new Error(
                'Could not find data with the specified key'
            );
        }
    }

    /**
     * Adds a number to the key. Throws error if key doesn't return a valid number.
     * 
     * @param {String} key 
     * @param {String|Number} number 
     * @example
     * db.add('key', 'number'); // adds the number to the data from the key
     */
    async add(key, number) {
        if (!key) throw new Error('No key was provided');
        if (typeof key !== 'string') throw new Error('Type of name must be a string');
        if (!number) throw new Error('No number was provided');
        if (isNaN(number)) throw new Error('Invalid number was provided');

        await schema.findOne({
            key: key
        }, async (err, data) => {
            if (err) throw err;

            if (data) {
                if (isNaN(data.value)) throw new Error(
                    'The specified key does not return a number'
                );

                data.value = parseInt(data.value) + number;
                await data.save();
            } else {
                await new schema({
                    key: key,
                    value: number
                }).save();
            }
        });
    }

    /**
     * Subtracts a number from the key. Throws error if key doesn't return a valid number.
     * 
     * @param {String} key 
     * @param {String|Number} number 
     * @example
     * db.subtract('key', 'number'); // subtracts the number from data from the key 
     */
    async subtract(key, number) {
        if (!key) throw new Error('No key was provided');
        if (typeof key !== 'string') throw new Error('Type of name must be a string');
        if (!number) throw new Error('No number was provided');
        if (isNaN(number)) throw new Error('Invalid number was provided');

        await schema.findOne({
            key: key
        }, async (err, data) => {
            if (err) throw err;

            if (data) {
                if (isNaN(data.value)) throw new Error(
                    'The specified key does not return a number'
                );

                data.value = parseInt(data.value) - number;
                await data.save();
            } else {
                await new schema({
                    key: key,
                    value: -number
                }).save();
            }
        });
    }

    /**
     * Length of the array or string of the key and value. Returns undefined if the data doesn't exist or doesn't return an array or string.
     * 
     * @param {String} key
     * @example 
     * await db.length('key'); // returns the length of the value and key, or undefined if data doesn't exist or doesn't return an array/string
     */
    async length(key) {
        if (!key) throw new Error('No key was provided');
        if (typeof key !== 'string') throw new Error('Type of name must be a string');

        const data = await schema.findOne({
            key: key
        });

        return data ? { key: data.key.length, value: data.value.length } : undefined;
    }

    /**
     * Get's the size of the database. This returns a promise.
     * 
     * @returns {Promise<Number>}
     */
    get size() {
        let size = schema.find({}).then(data => {
            let arr = [];
            if (data[0]) {
                data.forEach(e => {
                    arr.push(e.key);
                });
            }

            return arr.length;
        });

        return size;
    }
}

module.exports = DataBase;