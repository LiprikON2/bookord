const { parseEpub } = require("@liprikon/epub-parser");
const _ = require("lodash");

const mapInGroups = (arr, iteratee, groupSize) => {
    const groups = _.groupBy(arr, (_v, i) => Math.floor(i / groupSize));

    return Object.values(groups).reduce(
        async (memo, group) => [
            ...(await memo),
            ...(await Promise.all(group.map(iteratee))),
        ],
        []
    );
};
