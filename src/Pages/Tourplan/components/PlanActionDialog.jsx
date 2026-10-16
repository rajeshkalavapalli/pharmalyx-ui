import {
    CheckCircleRounded,
    DeleteSweepRounded,
    ReplyRounded,
    SendRounded,
    WarningAmberRounded,
} from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import { REVIEW_REMARKS_LIMIT } from "../index";

const ACTIONS = {
    submit: {
        icon: SendRounded,
        color: "primary",
        title: "Send for approval?",
        message:
            "Your manager will review the plan. You won't be able to edit it unless it is returned.",
        confirmLabel: "Send for approval",
        remarks: "none",
    },
    approve: {
        icon: CheckCircleRounded,
        color: "success",
        title: "Approve this tour plan?",
        message: "The plan becomes the reference for visits and deviation tracking this month.",
        confirmLabel: "Approve",
        remarks: "optional",
    },
    reject: {
        icon: ReplyRounded,
        color: "error",
        title: "Return for changes?",
        message: "Tell the representative what needs to change. They will see this note.",
        confirmLabel: "Return plan",
        remarks: "required",
    },
    clearMonth: {
        icon: DeleteSweepRounded,
        color: "error",
        title: "Clear the whole month?",
        message: "All planned days in this month will be removed. Nothing is saved until you save the draft.",
        confirmLabel: "Clear month",
        remarks: "none",
    },
    discard: {
        icon: WarningAmberRounded,
        color: "warning",
        title: "Discard unsaved changes?",
        message: "You have changes in this month that are not saved yet.",
        confirmLabel: "Discard and continue",
        remarks: "none",
    },
};

function PlanActionDialog({ action, busy, onClose, onConfirm }) {
    const config = ACTIONS[action];

    if (!config) return null;

    return (
        <ConfirmActionDialog
            {...config}
            remarksLimit={REVIEW_REMARKS_LIMIT}
            busy={busy}
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}

export default PlanActionDialog;
