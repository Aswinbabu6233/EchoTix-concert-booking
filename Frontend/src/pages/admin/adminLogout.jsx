import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../Components/redux/userslice";

const AdminLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(clearUser());
        localStorage.removeItem("user");
        navigate("/admin/login");
    }, [dispatch, navigate]);

    return null;
};

export default AdminLogout;
