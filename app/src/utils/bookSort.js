import React from "react";
import { Box, Center } from "@mantine/core";
import { AlphabetLatin, Calendar, CalendarStats, Clock } from "tabler-icons-react";

export const sortingData = [
    {
        value: "Title",
        label: (
            <Center>
                <AlphabetLatin size={16} />
                <Box ml={10}>Title</Box>
            </Center>
        ),
    },
    // {
    //     value: "Recent",
    //     label: (
    //         <Center>
    //             <Clock size={16} />
    //             <Box ml={10}>Recent</Box>
    //         </Center>
    //     ),
    // },
    {
        value: "Date Added",
        label: (
            <Center>
                <CalendarStats size={16} />
                <Box ml={10}>Date Added</Box>
            </Center>
        ),
    },
    {
        value: "Publish date",
        label: (
            <Center>
                <Calendar size={16} />
                <Box ml={10}>Publish date</Box>
            </Center>
        ),
    },
];

export const sortingSorters = {
    // ref: https://bobbyhadz.com/blog/react-sort-array-of-objects
    "Title": {
        Ascending: (a, b) => a.info.title.localeCompare(b.info.title),
        Descending: function (a, b) {
            return this.Ascending(a, b) * -1;
        },
    },
    "Recent": {
        Ascending: (a, b) => {
            return 0 || sortingSorters.Title.Ascending(a, b);
        },
        Descending: function (a, b) {
            return this.Ascending(a, b) * -1;
        },
    },
    "Date Added": {
        Ascending: (a, b) => {
            const { dateAdded: dateAddedStringA } = a;
            const { dateAdded: dateAddedStringB } = b;

            const diffA = Math.abs(
                new Date().getTime() - new Date(dateAddedStringA).getTime()
            );

            const diffB = Math.abs(
                new Date().getTime() - new Date(dateAddedStringB).getTime()
            );
            return diffA - diffB || sortingSorters.Title.Ascending(a, b);
        },
        Descending: function (a, b) {
            return this.Ascending(a, b) * -1;
        },
    },
    "Publish date": {
        Ascending: (a, b) => {
            const { date: dateA } = a.info;
            const { date: dateB } = b.info;

            const publishDateStringA =
                (typeof dateA === "object" && "_" in dateA ? dateA._ : dateA) ?? "0";
            const publishDateStringB =
                (typeof dateB === "object" && "_" in dateB ? dateB._ : dateB) ?? "0";

            const publishDateA = new Date(publishDateStringA).getTime();
            const publishDateB = new Date(publishDateStringB).getTime();

            return publishDateA - publishDateB || sortingSorters.Title.Ascending(a, b);
        },
        Descending: function (a, b) {
            return this.Ascending(a, b) * -1;
        },
    },
};

export const getSort = (sorting, sortingOrder) =>
    sortingSorters[sorting][sortingOrder].bind(sortingSorters[sorting]);
