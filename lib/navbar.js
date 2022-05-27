//import { useMediaQuery } from "./breakpoint";

import { useState } from 'react';
import Head from 'next/head';
import useSWR from 'swr';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import {
    useMediaQuery,
    AppBar,
    Toolbar,
    Typography,
    Link,
    Drawer,
    Box,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    Button,
    ListItemIcon,
} from '@mui/material';

import AddchartIcon from '@mui/icons-material/Addchart';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

import { useSession, getSession, signIn, signOut } from 'next-auth/react';
import { db } from './firebase';
import { doc, updateDoc, getDoc, collection } from 'firebase/firestore';

let balance = 1000;

function LoggedIn(session) {
    if (session) {
        return (
            <Button color="inherit" onClick={() => signOut()}>
                Logout
            </Button>
        );
    }
    return (
        <Button color="inherit" onClick={() => signIn()}>
            Login
        </Button>
    );
}

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function NavBar(props) {
    const [open, setOpen] = useState(false);
    const { data: session, status } = useSession();

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const { data, error } = useSWR('/api/db/user', fetcher);
    const br = useMediaQuery('(min-width:600px)');

    return (
        <>
            <Head>
                <title>{props.title}</title>
            </Head>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={handleDrawerOpen}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 0.85 }}
                        >
                            {props.title}
                        </Typography>
                        <Typography sx={{ flexGrow: 1 }}>
                            {br ? (
                                <>Balance: {data ? Math.round(data.user.balance * 100) / 100 : 0} USDT</>
                            ) : (
                                <>{data ? Math.round(data.user.balance * 100) / 100 : 0}</>
                            )}
                        </Typography>
                        {LoggedIn(session)}
                    </Toolbar>
                </AppBar>
                <Drawer
                    sx={{
                        width: br ? '20%' : '30%',
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: br ? '20%' : '30%',
                            boxSizing: 'border-box',
                        },
                    }}
                    variant="persistent"
                    anchor="left"
                    open={open}
                >
                    <Box>
                        <IconButton
                            aria-label="close"
                            onClick={handleDrawerClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Divider />
                    <List>
                        <ListItem>
                            <ListItem button component={Link} href="/portfolio">
                                <ListItemIcon>
                                    <AccountBalanceWalletIcon />
                                </ListItemIcon>
                                <ListItemText primary="Portfolio" />
                            </ListItem>
                        </ListItem>
                        <ListItem>
                            <ListItem button component={Link} href="/">
                                <ListItemIcon>
                                    <AddchartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Market" />
                            </ListItem>
                        </ListItem>
                        <ListItem>
                            <ListItem button component={Link} href="/scores">
                                <ListItemIcon>
                                    <LeaderboardIcon />
                                </ListItemIcon>
                                <ListItemText primary="Leaderboard" />
                            </ListItem>
                        </ListItem>
                    </List>
                </Drawer>
            </Box>
        </>
    );
}

async function getData(userId) {
    const users = collection(db, 'users');
    const docRef = doc(users, userId);
    const q = await getDoc(docRef);
    return q;
}

export async function getServerSideProps() {
    const { data: session } = useSession();

    if (session) {
        const userId = session.user.image.match('[0-9]+')[0];
        d = await (await getData(userId)).data();
    }

    const sample = 'sample data';
    return {
        props: {
            d,
            sample,
        },
    };
}
