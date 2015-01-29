function DataManager (instanceMethods) {
    var manager = new Map();
    var prop;

    for (prop in DataManager.prototype) {
        if (DataManager.prototype.hasOwnProperty(prop)) {
            manager[prop] = DataManager.prototype[prop];
        }
    }

    instanceMethods = instanceMethods || {};
    for (prop in instanceMethods) {
        if (instanceMethods.hasOwnProperty(prop)) {
            manager[prop] = instanceMethods[prop];
        }
    }

    return manager;
}

DataManager.prototype = {
    increment: function (key, by) {
        var val = this.get(key) + by;
        this.set(key, val);

        return val;
    }
};

module.exports = DataManager;
