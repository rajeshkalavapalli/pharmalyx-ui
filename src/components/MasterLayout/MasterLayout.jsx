import { Box, Button } from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

import PageHeader from "../PageHeader/PageHeader";
import Panel from "../Panel/Panel";
import SegmentedControl from "../SegmentedControl/SegmentedControl";

// Frame for admin master/mapping pages: header, back link, view tabs, content.
// tabs: [{ value, label, icon? }]
function MasterLayout({ eyebrow = "Configuration", title, subtitle, tabs, value, onTabChange, children }) {
    return (
        <Box>
            <PageHeader
                eyebrow={eyebrow}
                title={title}
                subtitle={subtitle}
                actions={
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRounded />}
                        component={RouterLink}
                        to="/admin/configuration"
                    >
                        All settings
                    </Button>
                }
            />

            <Panel
                disablePadding
                actions={
                    tabs && (
                        <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                            <SegmentedControl value={value} options={tabs} onChange={onTabChange} />
                        </Box>
                    )
                }
            >
                <Box sx={(theme) => ({ p: theme.panel.padding })}>{children}</Box>
            </Panel>
        </Box>
    );
}

export default MasterLayout;
