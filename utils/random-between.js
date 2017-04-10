// Returns random number in interval inclusive
module.exports = function interval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};