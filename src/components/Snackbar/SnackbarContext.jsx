import {
    createContext,
    useContext,
    useState
} from "react";

import {
    Snackbar,
    Alert
} from "@mui/material";


const SnackbarContext =
    createContext(null);


export function SnackbarProvider({
    children
}) {

    const [snackbar, setSnackbar] =
        useState({

            open: false,

            message: "",

            severity: "success",

        });


    // =====================================================
    // SHOW SNACKBAR
    // =====================================================

    const showSnackbar = (
        message,
        severity = "success"
    ) => {

        setSnackbar({

            open: true,

            message,

            severity,

        });

    };


    // =====================================================
    // CLOSE SNACKBAR
    // =====================================================

    const handleClose = (
        event,
        reason
    ) => {

        if (reason === "clickaway") {
            return;
        }


        setSnackbar(
            (previous) => ({

                ...previous,

                open: false,

            })
        );

    };


    return (

        <SnackbarContext.Provider
            value={{
                showSnackbar,
            }}
        >

            {children}


            {/* ================================================= */}
            {/* GLOBAL SNACKBAR */}
            {/* ================================================= */}

            <Snackbar

                open={
                    snackbar.open
                }

                autoHideDuration={
                    3000
                }

                onClose={
                    handleClose
                }

                anchorOrigin={{

                    vertical:
                        "bottom",

                    horizontal:
                        "right",

                }}

                sx={{

                    "& .MuiSnackbarContent-root": {

                        padding: 0,

                    },

                }}
            >

                <Alert

                    severity={
                        snackbar.severity
                    }

                    variant="filled"

                    onClose={
                        handleClose
                    }

                    sx={{

                        minWidth: {
                            xs: 280,
                            sm: 320,
                        },

                        borderRadius:
                            2,

                        fontSize:
                            13,

                        fontWeight:
                            500,

                        alignItems:
                            "center",

                        boxShadow:
                            3,


                        /* ========================================= */
                        /* ICON */
                        /* ========================================= */

                        "& .MuiAlert-icon": {

                            alignItems:
                                "center",

                        },


                        /* ========================================= */
                        /* CLOSE BUTTON */
                        /* ========================================= */

                        "& .MuiAlert-action": {

                            alignItems:
                                "center",

                            paddingTop:
                                0,

                            paddingBottom:
                                0,

                        },


                        /* ========================================= */
                        /* PREMIUM TRANSITION */
                        /* ========================================= */

                        transition:
                            "transform 180ms ease, box-shadow 180ms ease",


                        "&:hover": {

                            transform:
                                "translateY(-1px)",

                            boxShadow:
                                5,

                        },

                    }}

                >

                    {snackbar.message}

                </Alert>

            </Snackbar>

        </SnackbarContext.Provider>

    );

}


// =========================================================
// CUSTOM HOOK
// =========================================================

export function useSnackbar() {

    const context =
        useContext(SnackbarContext);


    if (!context) {

        throw new Error(
            "useSnackbar must be used inside SnackbarProvider"
        );

    }


    return context;

}