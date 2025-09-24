import React, { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    InputAdornment,
    TextField,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableCell,
    TableRow,
    TablePagination,
    Paper,
    Box
} from "@mui/material";
import { Search } from "lucide-react";

export default function StudentGpaTable({
                                            data: initialData = [],
                                            title = "Student GPA",
                                        }) {
    const [query, setQuery] = useState(""); // search query
    const [rows, setRows] = React.useState(initialData);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    React.useEffect(() => {
        if (!fetchUrl) return; // keep controlled-by-prop if no URL
        let alive = true;
        (async () => {
            try {
                const res = await fetch(fetchUrl, fetchOptions);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (alive) setRows(Array.isArray(json) ? json : []);
            } catch (e) {
                console.error("Failed to fetch rows", e);
                if (alive) setRows([]);
            }
        })();
        return () => { alive = false; };
    }, [fetchUrl, fetchOptions]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const data = rows ?? [];
        if (!q) return data;
        return data.filter((r) =>
            [r.studentName, r.courseName]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [rows, query]);
    if (!q) return data;
    return data.filter((r) =>
        [r.studentName, r.courseName]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
    );
}, [data, query]);

const pageRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
}, [filtered, page, rowsPerPage]);

const handleChangePage = (_e, newPage) => setPage(newPage);
const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
};

const formatNumber = (n, digits = 2) =>
    typeof n === "number" && !Number.isNaN(n) ? n.toFixed(digits) : "-";

return (
    <Card className="p-2">
        <CardHeader
            title={title}
            subheader={`${data.length} total record${data.length === 1 ? "" : "s"}`}
        />
        <CardContent>
            <TextField
                fullWidth
                placeholder="Search by student or course..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={18} />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell align="right">Avg %</TableCell>
                            <TableCell align="right">GPA</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pageRows.map((row) => (
                            <TableRow
                                key={`${row.studentId}-${row.courseId}`}
                                hover
                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                                <TableCell>{row.studentName ?? "-"}</TableCell>
                                <TableCell>{row.courseName ?? "-"}</TableCell>
                                <TableCell align="right">{formatNumber(row.avgPercent)}</TableCell>
                                <TableCell align="right">{formatNumber(row.gpa, 2)}</TableCell>
                            </TableRow>
                        ))}
                        {pageRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No matching results
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Rows"
                />
            </Box>
        </CardContent>
    </Card>
);
}

/**
 * Usage example:
 *
 * const data = [
 *   {
 *     courseId: 6,
 *     studentId: 5,
 *     studentName: "Piyush12 Joshi2",
 *     courseName: "Software Engineering",
 *     avgPercent: 10.0,
 *     gpa: 0.4,
 *   },
 *   {
 *     courseId: 2,
 *     studentId: 6,
 *     studentName: "rj yh",
 *     courseName: "Data Structures and Algorithms",
 *     avgPercent: 0.0,
 *     gpa: 0.0,
 *   },
 *   {
 *     courseId: 6,
 *     studentId: 6,
 *     studentName: "rj yh",
 *     courseName: "Software Engineering",
 *     avgPercent: 0.0,
 *     gpa: 0.0,
 *   },
 * ];
 *
 * <StudentGpaTable data={data} />
 */
