import React from "react";
import { Box, Center } from "@mantine/core";
import {
    Calendar,
    CalendarStats,
    Clock,
    MasksTheater,
    User,
    X,
} from "tabler-icons-react";

export const groupingData = [
    {
        value: "None",
        label: (
            <Center>
                <X size={16} />
                <Box ml={10}>None</Box>
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
        value: "Author",
        label: (
            <Center>
                <User size={16} />
                <Box ml={10}>Author</Box>
            </Center>
        ),
    },
    {
        value: "Genre",
        label: (
            <Center>
                <MasksTheater size={16} />
                <Box ml={10}>Genre</Box>
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

export const groupingReducers = {
    "None": (groups, file) => {
        if (!groups["All books"]) groups["All books"] = [];
        groups["All books"].push(file);
        return groups;
    },
    "Author": (groups, file) => {
        const { author } = file.info;

        if (!groups[author]) groups[author] = [];
        groups[author].push(file);
        return groups;
    },
    "Recent": (groups, file) => {
        const { recent: recentDateString } = file;

        const diff = Math.abs(
            new Date().getTime() - new Date(recentDateString).getTime()
        );
        const diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1;

        let daysAgoString;
        if (diffDays <= 1) {
            daysAgoString = "Today";
        } else if (diffDays <= 7) {
            daysAgoString = "Last week";
        } else if (diffDays <= 30) {
            daysAgoString = "Earlier this month";
        } else if (diffDays <= 60) {
            daysAgoString = "Last month";
        } else if (diffDays <= 365) {
            daysAgoString = "Earlier this year";
        } else {
            daysAgoString = "A long time ago";
        }

        if (!groups[daysAgoString]) groups[daysAgoString] = [];
        groups[daysAgoString].push(file);
        return groups;
    },
    "Date Added": (groups, file, index) => {
        const { dateAdded: dateAddedString } = file;

        const diff = Math.abs(new Date().getTime() - new Date(dateAddedString).getTime());
        // new Date().toISOString().slice(0, 10);
        const diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1; // TODO uncomment
        // const diffDays = index;

        let daysAgoString;
        if (diffDays <= 1) {
            daysAgoString = "Today";
        } else if (diffDays <= 7) {
            daysAgoString = "Last week";
        } else if (diffDays <= 30) {
            daysAgoString = "Earlier this month";
        } else if (diffDays <= 60) {
            daysAgoString = "Last month";
        } else if (diffDays <= 365) {
            daysAgoString = "Earlier this year";
        } else {
            daysAgoString = "A long time ago";
        }

        if (!groups[daysAgoString]) groups[daysAgoString] = [];
        groups[daysAgoString].push(file);
        return groups;
    },
    "Genre": (groups, file) => {
        const { subjects } = file.info;

        subjects.forEach((subject) => {
            if (!groups[subject]) groups[subject] = [];
            groups[subject].push(file);
        });
        if (!subjects.length) {
            if (!groups["Without a subject"]) groups["Without a subject"] = [];
            groups["Without a subject"].push(file);
        }

        return groups;
    },
    "Publish date": (groups, file) => {
        const { date } = file.info;

        const publishDate = typeof date === "object" && "_" in date ? date._ : date;

        let publishYear;
        if (publishDate) {
            publishYear = new Date(publishDate).toISOString().slice(0, 4);
        } else {
            publishYear = "Unknown year";
        }
        if (!groups[publishYear]) groups[publishYear] = [];
        groups[publishYear].push(file);

        return groups;
    },
};
