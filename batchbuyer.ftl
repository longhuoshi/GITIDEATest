<!DOCTYPE html>  
<html>  
<#include "/public/imports.ftl"/>
<@cache key="COMPANY_TYPE"> </@cache>
<style type="text/css">
</style>
<script src="${base.contextPath}/tpl/buyer/js/batchbuyer.js?nd=<@urlTimestamp/>"></script>

<body>
<div class="god-layout" god-layout-extend="sm" god-layout-sm="12" id="mainDiv">
	<div>
		<div id="searchGodBox" class="god-box">
			<div god-box-section="header" god-box-title="批量导入" god-box-collapse="false">
				&nbsp;&nbsp;&nbsp;&nbsp;
				<a href="${base.contextPath}/public/common/file/template.xls" target="_blank">
					<span style=":font-size:24px;font-weight:bold;color:#FF0000;">点击下载食堂批量信息导入模板</span>
				</a>
			</div>
			<form god-box-section="body" god-box-layout="1,1,2,2" id="importForm">
				<input type="hidden" id="entryName" name="entryName" god-box-section="ignore-layout"/>
		      	<select id="entryId" name="entryId"  god-box-section="group" god-box-label="子平台" god-box-tooltip="true" god-box-layout-xs="3,9" class="god-select" god-select-multiple="false" god-select-allowSearch="true" god-select-allowEmpty="true" god-select-allowClear="true" god-select-defaultValue=""  god-select-cascadeScope="container"  ></select>
		      	<input type="hidden" id="roleCompanyIds" name="roleCompanyIds" god-box-section="ignore-layout"/>
				<select id="roles_com_sel" god-box-section="group" god-box-label="食堂单位角色" god-box-layout-xs="3,9" class="god-select" god-select-multiple="true" god-select-allowEmpty="true"></select>
				<!-- <input type="hidden" id="roleBuyerIds" name="roleBuyerIds" god-box-section="ignore-layout"/>
				<select id="roles_buyer_sel" god-box-section="group" god-box-label="食堂角色" god-box-layout-xs="3,9" class="god-select" god-select-multiple="true" god-select-allowEmpty="true"></select>
				 -->
				<select id="companyType" name="companyType" class="god-select" god-select-multiple="false" god-select-allowSearch="false" god-select-allowEmpty="false" 
						god-select-allowClear="false" god-select-defaultValue="" god-select-cacheKey="COMPANY_TYPE" god-box-section="group" god-box-label="行业" god-box-layout-xs="3,9"></select>
				
				<input type="text" id="batchBuyerRsid" name="batchBuyerRsid" god-box-layout-xs="4,8"  god-box-section="group" god-box-label="批量导入食堂"
		class="god-upload"  god-box-suffix="
								space
								|btn[class=btn-primary,text=导入,click=importBuyer()]
								" god-upload-validation-allowedExtensions="xls" god-upload-validation-itemLimit="1" god-upload-validation-minSizeLimit="1024" god-upload-validation-maxSizeLimit="1024000" god-upload-editable="true" god-upload-request-endpoint="${base.contextPath}/pub/pubresource/upload?utp=${urltype}" god-upload-get-endpoint="${base.contextPath}/pub/pubresource/getfiles?utp=${urltype}"/>
			</form>
		</div>
	</div>
	
	<div>
		<div class="god-box box-primary">
			<div god-box-section="header" god-box-title="导入错误详情列表" god-modal-remove="false"></div>
			<div god-box-section="body" god-box-layout="1,1,1,1">
				<table id="buyerTable" class="table table-bordered table-hover" style="width:100%"></table>
			</div>
		</div>
	</div>
</div>


<div class="god-modal" god-modal-fade="false" god-modal-width="1000" god-modal-backdrop="static" god-modal-keyboard="false" id="detailModal" god-modal-fixed="top">
	<div god-modal-section="header" god-modal-title="报错信息" god-modal-remove="true"></div>
	<form god-box-section="body" god-box-layout="1,1,1,1" id="detailForm">
		<input type="hidden" id="id" name="id" god-modal-section="ignore-layout"/>
	</form>
	<div god-modal-section="body" god-modal-layout="1,1,1,1">
		<table id="detailTable" class="table table-bordered table-hover" style="width:100%"></table>
	</div>
	<div god-modal-section="footer">
		<button type="button" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-close"></i> 关闭</button>
	</div>
</div>

<form name="exportForm" id="exportForm" action="${base.contextPath}/buyer/buyerbatch/export?utp=${urltype}" method="post">
	<input type="hidden" id="id" name="id"  />
</form>

</body>  
</html>  