import '../styles/globals.css'
import { Box, AppBar, Toolbar, Typography, Button, IconButton, MenuIcon } from '@mui/material';

import { SessionProvider } from "next-auth/react"

function MyApp({ Component, pageProps: { page, session, ...pageProps } }) {
    return (<>
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    </>
    )
}


export function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    )
}

export default MyApp
