import { useEffect } from "react";

const useSort = (value, setValue, sorter, deps = []) => {
    useEffect(() => {
        console.log("op");
        setValue([...value].sort(sorter));
    }, deps);
};

export default useSort;
