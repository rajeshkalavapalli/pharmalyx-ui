import { useEffect, useMemo, useState } from "react";

import { Box } from "@mui/material";

import PageHeader from "../../components/PageHeader/PageHeader";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import { getMyPermissions } from "../DoctorRequests/index";
import { getPeople } from "./index";
import BoundariesTab from "./review/BoundariesTab";
import CoverageTab from "./review/CoverageTab";
import ExceptionsTab from "./review/ExceptionsTab";
import FlagsTab from "./review/FlagsTab";
import HospitalsTab from "./review/HospitalsTab";
import RulesTab from "./review/RulesTab";
import StockTab from "./review/StockTab";
import VisitsReview from "./review/VisitsReview";

// What counts as work, decided by the system. Managers view their team; head office sees everyone
// and is the only one who can override, grant exceptions, approve boundaries and change the rules.
function VerifiedWork() {
    const [permissions, setPermissions] = useState(null);
    const [people, setPeople] = useState([]);
    const [tab, setTab] = useState("visits");

    useEffect(() => {
        getMyPermissions().then(setPermissions).catch(() => setPermissions(new Set()));
        getPeople()
            .then((result) => setPeople(result.users || []))
            .catch(() => {});
    }, []);

    const headOffice = permissions?.has("verifiedwork.approve");
    const canEdit = permissions?.has("verifiedwork.edit");
    const canCount = permissions?.has("stockcount.create");

    const tabs = useMemo(
        () =>
            [
                { value: "visits", label: "Visits" },
                { value: "coverage", label: "Coverage" },
                { value: "flags", label: "Red flags" },
                { value: "stock", label: "Samples" },
                { value: "boundaries", label: "Boundaries" },
                { value: "exceptions", label: "Exceptions" },
                { value: "hospitals", label: "Hospitals" },
                { value: "rules", label: "Rules" },
            ].filter((item) => headOffice || canEdit || ["visits", "coverage", "flags", "stock"].includes(item.value)),
        [headOffice, canEdit]
    );

    if (!permissions) return null;

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · Verified work"
                title="Verified work"
                subtitle={
                    headOffice
                        ? "Head office: review results, override with a reason, set boundaries, exceptions and rule values. Every change is logged."
                        : "See which visits counted and why. Results are decided by the system; only head office can change them."
                }
            />
            <Box sx={(theme) => ({ mb: theme.stat.gap, overflowX: "auto" })}>
                <SegmentedControl value={tab} onChange={setTab} options={tabs} />
            </Box>

            {tab === "visits" && <VisitsReview people={people} canOverride={headOffice} />}
            {tab === "coverage" && <CoverageTab people={people} />}
            {tab === "flags" && <FlagsTab canAct={headOffice} />}
            {tab === "stock" && <StockTab people={people} canCount={canCount} />}
            {tab === "boundaries" && <BoundariesTab canEdit={canEdit} canApprove={headOffice} />}
            {tab === "exceptions" && <ExceptionsTab people={people} canGrant={headOffice} />}
            {tab === "hospitals" && <HospitalsTab canEdit={canEdit} />}
            {tab === "rules" && <RulesTab canEdit={canEdit} />}
        </Box>
    );
}

export default VerifiedWork;
