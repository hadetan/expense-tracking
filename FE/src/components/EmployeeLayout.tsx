import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Receipt as ReceiptIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const drawerWidth = 260;

interface NavItem {
    text: string;
    icon: React.ReactElement;
    path: string;
}

const navItems: NavItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'My Expenses', icon: <ReceiptIcon />, path: '/expenses' },
];

export default function EmployeeLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    const isSelected = (itemPath: string) => {
        if (itemPath === '/expenses') {
            return location.pathname === '/expenses' || location.pathname.startsWith('/expenses/');
        }

        return location.pathname === itemPath;
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Expense Tracker
                </Typography>
                <Typography variant="caption">Employee Portal</Typography>
            </Box>

            <Divider />

            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }} noWrap>
                        {user?.name || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {user?.email}
                    </Typography>
                </Box>
            </Box>

            <Divider />

            <List sx={{ flexGrow: 1, pt: 2 }}>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            selected={isSelected(item.path)}
                            onClick={() => handleNavigation(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isSelected(item.path) ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {isMobile && (
                <AppBar
                    position="fixed"
                    sx={{
                        width: '100%',
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    <Toolbar>
                        <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            Expense Tracker
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: 'grey.100',
                    pt: isMobile ? 8 : 0,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
