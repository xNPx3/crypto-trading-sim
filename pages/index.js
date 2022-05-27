import table from '../styles/Table.module.css';
import { useState, useRef } from 'react';
import graph from '../styles/graphContainer.module.css';
import { toTitleCase } from './_app';
import NavBar from '../lib/navbar';
import BuyForm from '../lib/form';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js';
import faker from '@faker-js/faker';
import { fetchMarketData } from '../lib/fetch-market-data';
import {
    Tabs,
    Tab,
    Typography,
    Button,
    Box,
    Alert,
    FormControl,
    FormControlLabel,
    TextField,
    Grid,
    Paper,
    useMediaQuery,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { useSession, signIn, signOut } from 'next-auth/react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            key={`tabpanel-${index}`}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </Box>
    );
}

export default function App({ coins, prices, data }) {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const h = (event) => {
        console.log(event.target.value);
    };

    const { data: session, status } = useSession();

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    return (
        <>
            <NavBar title="Simulator" />

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

            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        key={value}
                    >
                        {coins.map((k) => {
                            return <Tab key={k} label={k} />;
                        })}
                    </Tabs>
                </Box>
                {
                    // alert the user when not logged in
                    !session && status != 'loading' && (
                        <Alert
                            sx={{ margin: '3vmin' }}
                            severity="warning"
                            action={
                                <Button
                                    onClick={() => signIn()}
                                    color="inherit"
                                    size="small"
                                >
                                    Login
                                </Button>
                            }
                        >
                            You are not logged in. Log in to start buying
                            crypto.
                        </Alert>
                    )
                }
                {data.map((obj, index) => {
                    const labels = obj.prices.map(function (o) {
                        let labels = new Intl.DateTimeFormat('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })
                            .format(o[0])
                            .toString();
                        return labels;
                    });

                    const data = obj.prices.map(function (o) {
                        return o[1];
                    });
                    return (
                        <TabPanel value={value} index={index}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={session ? 9 : 12}>
                                    <Paper
                                        sx={{
                                            padding: '2%',
                                            height: '100%',
                                        }}
                                        elevation={3}
                                    >
                                        <Typography variant="h6" align="center">
                                            24h price
                                        </Typography>
                                        <Line
                                            className={graph.graph}
                                            key={table.head}
                                            datasetIdKey="id"
                                            data={{
                                                labels: labels,
                                                datasets: [
                                                    {
                                                        label:
                                                            toTitleCase(
                                                                obj.name
                                                            ) + ' (USDT)',
                                                        data: data,
                                                        borderColor:
                                                            faker.internet.color(),
                                                        lineTension: 0,
                                                        borderJoinStyle:
                                                            'round',
                                                        pointRadius: 0,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                scales: {
                                                    x: {
                                                        display: false,
                                                    },
                                                    y: {
                                                        ticks: {
                                                            beginAtZero: true,
                                                            callback: function (
                                                                value,
                                                                index,
                                                                values
                                                            ) {
                                                                return `$${
                                                                    Math.round(
                                                                        value *
                                                                            100
                                                                    ) / 100
                                                                }`;
                                                            },
                                                        },
                                                    },
                                                },
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                },
                                            }}
                                        />
                                    </Paper>
                                </Grid>

                                {session && (
                                    <Grid item xs={12} sm={3}>
                                        <Paper
                                            sx={{
                                                padding: '2%',
                                                textAlign: 'center',
                                                height: '100%',
                                            }}
                                            elevation={3}
                                        >
                                            <Typography
                                                variant="h5"
                                                align="center"
                                                sx={{ 'margin-top': '3%' }}
                                            >
                                                Buy {toTitleCase(obj.name)}
                                            </Typography>
                                            <Typography sx={{ color: '#444' }}>
                                                1 {toTitleCase(obj.name)} ={' '}
                                                {Math.round(data.at(-1) * 100) /
                                                    100}{' '}
                                                USDT
                                            </Typography>
                                            <BuyForm
                                                currentPrice={
                                                    Math.round(
                                                        data.at(-1) * 100
                                                    ) / 100
                                                }
                                                coin={obj.name}
                                            />
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </TabPanel>
                    );
                })}
            </Box>
        </>
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

    //const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + coins.join() + '&vs_currencies=eur%2Cusd')
    //const prices = await res.json()

    const data = await fetchMarketData(coins);

    return {
        props: {
            coins,
            data,
        },
    };
}
