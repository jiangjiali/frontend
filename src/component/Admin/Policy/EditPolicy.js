import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { toggleSnackbar } from "../../../redux/explorer";
import API from "../../../middleware/Api";
import EditPro from "./Guid/EditPro";
import LocalGuide from "./Guid/LocalGuide";
import RemoteGuide from "./Guid/RemoteGuide";
import { transformResponse } from "./utils";

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

export default function EditPolicyPreload() {
    const classes = useStyles();
    const [type, setType] = useState("");
    const [policy, setPolicy] = useState({});

    const { mode, id } = useParams();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        setType("");
        API.get("/admin/policy/" + id)
            .then((response) => {
                response = transformResponse(response);
                setPolicy(response.data);
                setType(response.data.Type);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, [id]);

    return (
        <div>
            <Paper square className={classes.content}>
                {mode === "guide" && (
                    <>
                        {type === "local" && <LocalGuide policy={policy} />}
                        {type === "remote" && <RemoteGuide policy={policy} />}
                    </>
                )}

                {mode === "pro" && type !== "" && <EditPro policy={policy} />}
            </Paper>
        </div>
    );
}
