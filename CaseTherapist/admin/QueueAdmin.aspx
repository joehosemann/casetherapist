<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="QueueAdmin.aspx.cs" Inherits="hapiservice.Views.Reporter.admin.QueueAdmin" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <asp:SqlDataSource ID="bbapps" runat="server" ConnectionString="<%$ ConnectionStrings:JosephHoBBAppsConnectionString %>" 
            SelectCommand="SELECT casetherapist_CallTypes.ID, casetherapist_CallTypes.CallTypeID, casetherapist_CallTypes.ProductID, casetherapist_CallTypes.Name, casetherapist_CallTypes.IsDisabled, casetherapist_Products.Name AS Product_Name, casetherapist_Products.ID AS Product_ID FROM casetherapist_CallTypes INNER JOIN casetherapist_Products ON casetherapist_CallTypes.ProductID = casetherapist_Products.ID" 
            DeleteCommand="DELETE FROM [casetherapist_CallTypes] WHERE [ID] = @ID" 
            InsertCommand="INSERT INTO [casetherapist_CallTypes] ([CallTypeID], [ProductID], [Name], [IsDisabled]) VALUES (@CallTypeID, @ProductID, @Name, @IsDisabled)" 
            UpdateCommand="UPDATE [casetherapist_CallTypes] SET [CallTypeID] = @CallTypeID, [ProductID] = @Product_ID, [Name] = @Name, [IsDisabled] = @IsDisabled WHERE [ID] = @ID">
            <DeleteParameters>
                <asp:Parameter Name="ID" Type="Int32" />
            </DeleteParameters>
            <InsertParameters>
                <asp:Parameter Name="CallTypeID" Type="Int32" />
                <asp:Parameter Name="ProductID" Type="Int32" />
                <asp:Parameter Name="Name" Type="String" />
                <asp:Parameter Name="IsDisabled" Type="Byte" />
            </InsertParameters>
            <UpdateParameters>
                <asp:Parameter Name="CallTypeID" Type="Int32" />
                <asp:Parameter Name="Product_ID" Type="Int32" />
                <asp:Parameter Name="Name" Type="String" />
                <asp:Parameter Name="IsDisabled" Type="Byte" />
                <asp:Parameter Name="ID" Type="Int32" />
            </UpdateParameters>
        </asp:SqlDataSource>
        <asp:SqlDataSource ID="ProductDropDownDS" runat="server" ConnectionString="<%$ ConnectionStrings:JosephHoBBAppsConnectionString %>" SelectCommand="SELECT ID as Product_ID, Name as Product_Name, IsDisabled, MarketID from casetherapist_Products" />
   
        <asp:GridView ID="GridView2" runat="server" AutoGenerateColumns="False" DataKeyNames="ID" DataSourceID="bbapps">
            <Columns>
                <asp:CommandField ShowEditButton="True" />
                <asp:TemplateField HeaderText="Product_ID" SortExpression="Product_ID">
                    <EditItemTemplate>
                        <asp:DropDownList ID="DropDownList1" runat="server"
                            DataSourceID="ProductDropDownDS" DataTextField="Product_Name" DataValueField="Product_ID"   >
                        </asp:DropDownList>
                    </EditItemTemplate>
                    <ItemTemplate>
                        <asp:Label ID="Label1" runat="server" Text='<%# Bind("Product_Name") %>'></asp:Label>                        
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:BoundField DataField="ID" HeaderText="ID" InsertVisible="False" ReadOnly="True" SortExpression="ID" Visible="False" />
                <asp:BoundField DataField="CallTypeID" HeaderText="CallTypeID" SortExpression="CallTypeID" />
                <asp:BoundField DataField="Name" HeaderText="Name" SortExpression="Name" />
                <asp:BoundField DataField="IsDisabled" HeaderText="IsDisabled" SortExpression="IsDisabled" />
            </Columns>
        </asp:GridView>
   
    </form>
</body>
</html>
