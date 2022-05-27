import * as React from 'react';
import { toTitleCase } from './_app';
import NavBar from '../lib/navbar';
import useSWR from 'swr';
import { NumberFormatCustom } from '../lib/form';

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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSession } from 'next-auth/react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function Portfolio(props) {
    const { data: session, status } = useSession();
    const { data, error } = useSWR('/api/db/user', fetcher);

    const [loading, setLoading] = React.useState(false);
    const [_error, setError] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [amount, setAmount] = React.useState(0);
    const [msg, setMsg] = React.useState(false);

    const br = useMediaQuery('(min-width:600px)');

    const handleClick = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log({
            amount: e.target.attributes.amount.value,
            coin: e.target.attributes.value.value,
            cPrice: e.target.attributes.cprice.value,
        });
        const res = await fetch('/api/db/sell', {
            body: JSON.stringify({
                amount: e.target.attributes.amount.value,
                coin: e.target.attributes.value.value,
                cPrice: e.target.attributes.cprice.value,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        }).then((data) => {
            setLoading(false);
            const j = data.json();
            j.then((data) => {
                setError(data.error);
                setSuccess(!data.error);
                setMsg(data.msg);
                console.log(data);
            });
        });
    };

    if (!data) {
        return (
            <Box>
                <NavBar title="Portfolio" />
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
            </Box>
        );
    }

    return (
        <Box>
            <NavBar title="Portfolio" />

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

            <Snackbar
                open={_error}
                autoHideDuration={6000}
                onClose={() => {
                    setError(false);
                }}
            >
                <Alert
                    onClose={() => {
                        setError(false);
                    }}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {msg}
                </Alert>
            </Snackbar>
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={() => {
                    setSuccess(false);
                }}
            >
                <Alert
                    onClose={() => {
                        setSuccess(false);
                    }}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    {msg}
                </Alert>
            </Snackbar>

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
                                <TableCell>Coin</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="right">Buy price</TableCell>
                                <TableCell align="right">
                                    Current price
                                </TableCell>
                                <TableCell align="right">Change</TableCell>
                                <TableCell align="right">
                                    <TextField
                                        label="Amount"
                                        name="amount"
                                        InputProps={{
                                            inputComponent: NumberFormatCustom,
                                        }}
                                        variant="outlined"
                                        size="small"
                                        onInput={(e) => {
                                            setAmount(e.target.value);
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.keys(data.user.wallet).map((key, index) => {
                                let value = data.user.wallet[key];
                                if (value.amount != 0) {
                                    return (
                                        <TableRow
                                            key={key}
                                            sx={{
                                                '&:last-child td, &:last-child th':
                                                    {
                                                        border: 0,
                                                    },
                                            }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {toTitleCase(key)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {Math.floor(
                                                    value.amount * 100000000
                                                ) / 100000000}
                                            </TableCell>
                                            <TableCell align="right">
                                                {value.price} USDT
                                            </TableCell>
                                            <TableCell align="right">
                                                {props.data[key].usd} USDT
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    color={
                                                        Math.round(
                                                            ((props.data[key]
                                                                .usd -
                                                                value.price) /
                                                                value.price) *
                                                                10000
                                                        ) /
                                                            100 <
                                                        0
                                                            ? '#ff0000'
                                                            : '#32CD32'
                                                    }
                                                >
                                                    {Math.round(
                                                        ((props.data[key].usd -
                                                            value.price) /
                                                            value.price) *
                                                            10000
                                                    ) / 100}{' '}
                                                    %
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <LoadingButton
                                                    color="error"
                                                    sx={{
                                                        mr: 2,
                                                    }}
                                                    loading={loading}
                                                    value={key}
                                                    cprice={value.price}
                                                    amount={value.amount}
                                                    onClick={handleClick}
                                                    variant="outlined"
                                                    disabled={!value.amount}
                                                >
                                                    Sell all
                                                </LoadingButton>
                                                <LoadingButton
                                                    loading={loading}
                                                    value={key}
                                                    cprice={value.price}
                                                    amount={amount}
                                                    onClick={handleClick}
                                                    variant="outlined"
                                                    disabled={!value.amount}
                                                >
                                                    Sell
                                                </LoadingButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export async function getServerSideProps() {
    const coins = [
        'bitcoin',
        'ethereum',
        'solana',
        'ripple',
        'cardano',
        'tether',
        'polkadot',
    ];

    const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=' +
            coins.join() +
            '&vs_currencies=usd',
        { redirect: 'follow' }
    );

    const data = await res.json();

    /*const data = {
        ripple: { usd: 0.430276 },
        cardano: { usd: 0.528303 },
        bitcoin: { usd: 30244 },
        tether: { usd: 1.002 },
        solana: { usd: 51.61 },
        polkadot: { usd: 9.87 },
        ethereum: { usd: 2024.38 },
    };*/
    return {
        props: {
            coins,
            data,
        },
    };
}
