module.exports = {
    getRandomInt: function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        let value = Math.floor(Math.random() * (max - min + 1)) + min;
        return value;
    }
}
