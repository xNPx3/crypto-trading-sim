import NumberFormat from 'react-number-format';
import * as React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Input,
    InputLabel,
    TextField,
    FormControl,
    Snackbar,
    Alert,
    Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

export const NumberFormatCustom = React.forwardRef(function NumberFormatCustom(
    props,
    ref
) {
    const { onChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
            isNumericString
            decimalScale={8}
            allowNegative={false}
            allowedDecimalSeparators={['.', ',']}
        />
    );
});

NumberFormatCustom.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};
const handleChange = (event) => {
    setValues({
        ...values,
        [event.target.name]: event.target.value,
    });
};

// horrible idea to pass the current coin price in the request as it can be intercepted but I have not time to implement it better
export default function BuyForm({ currentPrice, coin }) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [msg, setMsg] = React.useState(false);
    const [amount, setAmount] = React.useState("");
    const [price, setPrice] = React.useState("");


    const hh = async (event) => {
        event.preventDefault();
        setLoading(true);
        const res = await fetch('/api/db/buy', {
            body: JSON.stringify({
                amount: event.target.amount.value,
                coin: event.target.coin.value,
                cPrice: event.target.cPrice.value,
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
                setSuccess(!data.error)
                setMsg(data.msg);
            });
        });
    };

    return (
        <>
            <Snackbar
                open={error}
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
            <form onSubmit={hh} method="post" autocomplete="off">
                <FormControl>
                    <TextField
                        label="Amount"
                        name="amount"
                        InputProps={{
                            inputComponent: NumberFormatCustom,
                        }}
                        variant="outlined"
                        margin="dense"
                        onInput={(e) => {
                            setPrice(Math.round(e.target.value * currentPrice * 100) / 100)
                        }}
                        required
                    />
                    <TextField
                        label="Price"
                        name="price"
                        InputProps={{
                            inputComponent: NumberFormatCustom,
                        }}
                        value={price}
                        variant="outlined"
                        margin="dense"
                        required
                        disabled
                    />
                    <TextField
                        name="cPrice"
                        type="hidden"
                        value={currentPrice}
                    />
                    <TextField name="coin" type="hidden" value={coin} />
                    <LoadingButton
                        loading={loading}
                        variant="contained"
                        type="submit"
                        margin="dense"
                        loadingIndicator="Loading..."
                    >
                        Submit
                    </LoadingButton>
                </FormControl>
            </form>
        </>
    );
}
