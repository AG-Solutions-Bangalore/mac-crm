import PageHeader from "@/components/common/page-header";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePersistedPage } from "@/hooks/usePersistedPage";
import { usePersistedSearch } from "@/hooks/usePersistedSearch";
import { Edit, Contact } from "lucide-react";
import { toast } from "sonner";
import DataTable from "@/components/common/data-table";
import ApiErrorPage from "@/components/api-error/api-error";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useSalesTeamMembersQuery,
  useUpdateSalesTeamMemberMutation,
} from "../hooks/useSalesTeam";
import { getSalesTeamMemberId } from "../api/salesTeamApi";

const getMembers = (responseData) => {
  const payload = responseData?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const SalesTeamListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = usePersistedPage();
  const [searchTerm, setSearchTerm] = usePersistedSearch();

  const {
    data: responseData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useSalesTeamMembersQuery(page, searchTerm);

  const updateMutation = useUpdateSalesTeamMemberMutation();

  const memberList = getMembers(responseData);
  const payload = responseData?.data;
  const pagination = Array.isArray(payload?.data) ? payload : null;

  const handleToggleStatus = (member) => {
    const memberId = getSalesTeamMemberId(member);
    const newStatus = member.status === "Active" ? "Inactive" : "Active";
    updateMutation.mutate(
      {
        id: memberId,
        data: {
          name: member.name,
          email: member.email,
          mobile: member.mobile,
          status: newStatus,
        },
      },
      {
        onSuccess: (res) =>
          toast.success(res?.message || `Status changed to ${newStatus}`),
        onError: (err) =>
          toast.error(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to update status"
          ),
      }
    );
  };

  const columns = [
    {
      header: "SlNo",
      accessorKey: "slno",
      enableSorting: false,
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
      cell: ({ row }) => row.original.mobile || "-",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const member = row.original;
        const isUpdating =
          updateMutation.isPending &&
          String(updateMutation.variables?.id) ===
            String(getSalesTeamMemberId(member));
        return (
          <div className="flex items-center gap-3 px-1 py-1 min-w-[120px]">
            <Switch
              checked={member.status === "Active"}
              onCheckedChange={() => handleToggleStatus(member)}
              disabled={isUpdating}
              className="shrink-0"
            />
            <span
              className={`text-xs font-bold leading-none select-none w-[55px] inline-block shrink-0 ${
                member.status === "Active"
                  ? "text-success"
                  : "text-muted-foreground"
              }`}
            >
              {member.status || "-"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <abbr title="Edit Member">
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                navigate(
                  `/sales-team-list/edit/${getSalesTeamMemberId(row.original)}`
                )
              }
            >
              <Edit className="h-4 w-4" />
            </Button>
          </abbr>
        </div>
      ),
    },
  ];

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <PageHeader
        icon={Contact}
        title="Sales Team"
        description="Manage members shown in the Prepared By dropdown of quotation reports"
      />
      <DataTable
        isLoading={isLoading || isFetching}
        data={memberList}
        columns={columns}
        searchPlaceholder="Search member..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={{
          onClick: () => navigate("/sales-team-list/create"),
          label: "Add Member",
        }}
        backendPagination={true}
        page={pagination?.current_page || 1}
        totalPages={pagination?.last_page || 1}
        totalRecords={pagination?.total ?? memberList.length}
        onPageChange={setPage}
      />
    </div>
  );
};

export default SalesTeamListPage;
