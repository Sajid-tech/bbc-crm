import React, { useContext, useEffect, useMemo, useState } from "react";
import Layout from "../../layout/Layout";
import { ContextPanel } from "../../utils/ContextPanel";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../base/BaseUrl";
import MUIDataTable from "mui-datatables";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import { ButtonConfig } from "../../config/ButtonConfig";
import { TrashIcon } from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress
} from "@mui/material";
import { toast } from "react-toastify";
import PageLoader from "../../components/PageLoader";

const Contact = () => {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isPanelUp,userAdminType } = useContext(ContextPanel);
  const navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contactIdToDelete, setContactIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        if (!isPanelUp) {
          navigate("/maintenance");
          return;
        }
        setLoading(true);
        const token = localStorage.getItem("token");
        const resposne = await axios.get(
          `${BASE_URL}/api/panel-fetch-contact`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setContactData(resposne?.data?.contact);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  const handleDeleteClick = (userId) => {
    setContactIdToDelete(userId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${BASE_URL}/api/panel-delete-contact/${contactIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
     
      toast.success(response.data.msg || "Contact deleted successfully");
      
    
      const fetchResponse = await axios.get(
        `${BASE_URL}/api/panel-fetch-contact`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContactData(fetchResponse?.data?.contact);
    } catch (error) {
      console.error("Error deleting contact", error);
      toast.error(error.response?.data?.message || "Failed to delete contact");
    } finally {
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
      setContactIdToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setContactIdToDelete(null);
  };

  const columns = useMemo(
    () => [
      {
        name: "slNo",
        label: "SL No",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return tableMeta.rowIndex + 1;
          },
        },
      },
      {
        name: "contact_name",
        label: "Name",
        options: {
          filter: true,
          sort: true,
        },
      },
      {
        name: "contact_email",
        label: "Email",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "contact_mobile",
        label: "Mobile",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "contact_message",
        label: "Message",
        options: {
          filter: true,
          sort: false,
        },
      },
      ...(userAdminType === "superadmin"
        ? [
            {
              name: "id",
              label: "Action",
              options: {
                filter: true,
                sort: false,
                customBodyRender: (userId) => {
                  return (
                    <div>
                      <TrashIcon
                        title="Delete Contact"
                        className="h-5 w-5 text-red-400 hover:text-red-800 cursor-pointer"
                        onClick={() => handleDeleteClick(userId)}
                      />
                    </div>
                  );
                },
              },
            },
          ]
        : []),
        {
          name: "id",
          label: "Action",
          options: {
            filter: true,
            sort: false,
            customBodyRender: (userId) => {
              return (
                <div>
                  <TrashIcon 
                    title="Delete Contact" 
                    className="h-5 w-5 text-red-400 hover:text-red-800 cursor-pointer" 
                    onClick={() => handleDeleteClick(userId)}
                  />
                </div>
              );
            },
          },
        },
    
      
    ],
    [contactData]
  );

  const options = {
    selectableRows: "none",
    elevation: 0,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10, 25],
    responsive: "standard",
    viewColumns: false,
    download: false,
    print: false,
  };

  const data = useMemo(() => (contactData ? contactData : []), [contactData]);
  if(loading){
    return (
      <PageLoader/>
  )
  }
  return (
    <Layout>
      <div className="container mx-auto mt-5">
        <Card className={`p-8 bg-gradient-to-r  px-8 py-5 border  ${ButtonConfig.borderCard} hover:shadow-2xl transition-shadow duration-300`}>
          <CardHeader className={`text-center border ${ButtonConfig.borderCard} rounded-lg shadow-lg p-0 mb-6`}>
            <Typography variant="h4" color={ButtonConfig.typographyColor} className="font-bold">
              Contact List from Website
            </Typography>
          </CardHeader>
          <CardBody className="p-0">
            <MUIDataTable
              data={data}
              columns={columns}
              options={options}
            />
          </CardBody>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this contact? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary" disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Contact;