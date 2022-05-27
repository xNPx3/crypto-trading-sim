import * as React from 'react';
import { toTitleCase } from './_app';
import NavBar from '../lib/navbar';
import useSWR from 'swr';
import { NumberFormatCustom } from '../lib/form';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

import {
    Alert,
    Snackbar,
    Typography,
    Button,
    Box,
    FormControl,
    TextField,
    Grid,
    Paper,
    useMediaQuery,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
    TablePagination,
    IconButton,
} from '@mui/material';
import PropTypes from 'prop-types';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { LoadingButton } from '@mui/lab';
import { useSession } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';

export default function Leaderboard(props) {
    const { data: session, status } = useSession();

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - props.data.length)
            : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const br = useMediaQuery('(min-width:600px)');

    return (
        <Box>
            <NavBar title="Leaderboard" />

            {status == 'loading' && (
                <>
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        style={{ minHeight: '100vh' }}
                    >
                        <Grid item xs={3}>
                            <CircularProgress />
                        </Grid>
                    </Grid>
                </>
            )}

            <Box
                sx={{
                    p: br ? 2 : 0,
                    width: '100%',
                }}
            >
                <TableContainer
                    sx={{
                        p: br ? 2 : 0,
                        height: '100%',
                    }}
                    elevation={10}
                    component={Paper}
                >
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">ID</TableCell>
                                <TableCell align="right">Balance (USDT)</TableCell>
                                <TableCell align="right">Portfolio</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(rowsPerPage > 0
                                ? props.data.slice(
                                      page * rowsPerPage,
                                      page * rowsPerPage + rowsPerPage
                                  )
                                : props.data
                            ).map((o) => {
                                return (
                                    <TableRow>
                                        <TableCell>{o.name}</TableCell>
                                        <TableCell align="right">{o.id}</TableCell>
                                        <TableCell align="right">{Math.round(o.balance * 10000) / 10000}</TableCell>
                                        <TableCell align="right">
                                            {Object.keys(o.wallet).map((key)=>{
                                                if(o.wallet[key].amount > 0)
                                                {
                                                    return (<>{toTitleCase(key)}: {o.wallet[key].amount} <br /></>)
                                                }
                                            })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TablePagination
                                rowsPerPageOptions={[1, 10, 25, 100]}
                                count={props.data.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export async function getServerSideProps() {
    const users = collection(db, 'users');
    const docs = await getDocs(users);
    let data = {};

    docs.forEach((doc) => {
        data[doc.id] = doc.data();
        //console.log(doc.id, ' => ', doc.data());
    });

    function orderBySubKey(input, key) {
        return Object.values(input)
            .map((value) => value)
            .sort((a, b) => a[key] - b[key]);
    }

    data = orderBySubKey(data, 'balance');
    data = data.reverse()

    return {
        props: {
            data,
        },
    };
}
