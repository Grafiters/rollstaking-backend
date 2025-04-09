const queue = [];

module.exports = {  
    addJob: (job) => queue.push(job),
    getJob: () => queue.shift(),
    hasJob: () => queue.length > 0
}