import { useEffect } from "react";

const useSort = (value, setValue, sorter, deps = []) => {
    useEffect(() => {
        setValue([...value].sort(sorter));
    }, deps);
};

export default useSort;
