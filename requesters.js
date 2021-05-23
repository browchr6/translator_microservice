var requesters = new Set(); // requester keys will be added to the set

requesters.add(process.env.requesterKey);

module.exports.requesters = requesters;
