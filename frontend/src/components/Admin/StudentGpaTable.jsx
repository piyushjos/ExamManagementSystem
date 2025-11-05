import React, {useEffect, useMemo, useState} from "react";
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
    Box,
    Button,
    Alert,
} from "@mui/material";
// import { Search } from "lucide-react";
import api from "../../services/api.js";

export default function StudentGpaTable({
                                            title = "Student GPA",
                                        }) {
    const [query, setQuery] = useState("");          // search query
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [rows, setRow] = useState([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadStudentData = async () => {
        try {
            setLoading(true);
            setError("");
            const gpa = await api.admin.getAnalytics();
            console.log("my gpa====>", gpa)
            setRow(Array.isArray(gpa) ? gpa : []);
        } catch (err) {
            console.error("Failed to load student data:", err);
            setError(err.message || "Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudentData();
    }, []);




    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) =>
            [r.studentName, r.courseName]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [rows, query]);

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
                subheader={`${rows.length} total record${rows.length === 1 ? "" : "s"}`}
                action={
                    <Button
                        variant="contained"
                        onClick={loadStudentData}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Get Analytics"}
                    </Button>
                }
            />
            <CardContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <TextField
                    fullWidth
                    placeholder="Search by student or course..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {/*<Search size={18} />*/}
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
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Loading analytics...
                                    </TableCell>
                                </TableRow>
                            )}
                            {pageRows.map((row) => (
                                <TableRow
                                    key={`${row.studentId}-${row.courseId}`}
                                    hover
                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                    <TableCell>{row.studentName ?? "-"}</TableCell>
                                    <TableCell>{row.courseName ?? "-"}</TableCell>
                                    <TableCell align="right">
                                        {formatNumber(row.avgPercent)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatNumber(row.gpa, 2)}
                                    </TableCell>
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
