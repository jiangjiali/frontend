import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { useParams } from "react-router";
import LocalGuide from "./Guid/LocalGuide";
import RemoteGuide from "./Guid/RemoteGuide";

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100,
        },
        marginBottom: 40,
    },
    content: {
        padding: theme.spacing(2),
    },
}));

export default function AddPolicyParent() {
    const classes = useStyles();

    const { type } = useParams();

    return (
        <div>
            <Paper square className={classes.content}>
                {type === "local" && <LocalGuide />}
                {type === "remote" && <RemoteGuide />}
            </Paper>
        </div>
    );
}
