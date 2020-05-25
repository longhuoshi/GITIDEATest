
accessid = ''
accesskey = ''
host = ''
policyBase64 = ''
signature = ''
callbackbody = ''
filename = ''
key = ''
expire = 0
g_object_name = ''
g_object_name_type = ''
now = timestamp = Date.parse(new Date()) / 1000; 
finallyServerUrl ='';
var uploader = null;
	
var fileHashMap = new HashMap();
var existServerFile = new HashMap();
var limitRepeatFile = new HashMap();

function send_request()
{
    var xmlhttp = null;
    if (window.XMLHttpRequest)
    {
        xmlhttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
  
    if (xmlhttp!=null)
    {
        // serverUrl是 用户获取 '签名和Policy' 等信息的应用服务器的URL，请将下面的IP和Port配置为您自己的真实信息。
        serverUrl = contextPath+'/aliyunoss/authorityServer/getpolicy';
		
        xmlhttp.open( "GET", serverUrl, false );
        xmlhttp.send( null );
        return xmlhttp.responseText
    }
    else
    {
        alert("Your browser does not support XMLHTTP.");
    }
};

function check_object_radio() {
    var tt = document.getElementsByName('myradio');
    for (var i = 0; i < tt.length ; i++ )
    {
        if(tt[i].checked)
        {
            g_object_name_type = tt[i].value;
            break;
        }
    }
}

function get_signature()
{
    // 可以判断当前expire是否超过了当前时间， 如果超过了当前时间， 就重新取一下，3s 作为缓冲。
    now = timestamp = Date.parse(new Date()) / 1000; 
    if (expire < now + 3)
    {
        body = send_request()
        var obj = eval ("(" + body + ")");
        host = obj['host']
        policyBase64 = obj['policy']
        accessid = obj['accessid']
        signature = obj['signature']
        expire = parseInt(obj['expire'])
        callbackbody = obj['callback'] 
        key = obj['dir']
        return true;
    }
    return false;
};

function random_string(len) {
　　len = len || 32;
　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
　　var maxPos = chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
    　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function get_suffix(filename) {
    pos = filename.lastIndexOf('.')
    suffix = ''
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    
    return suffix;
}

function calculate_object_name(filename)
{
    // if (g_object_name_type == 'local_name')
    // {
    //     g_object_name += "${filename}"

    // }
    // else if (g_object_name_type == 'random_name')
    // {
    //     suffix = get_suffix(filename)
    //     g_object_name = key + random_string(10) + suffix
        g_object_name = key + filename;
    // }
    return ''
}

function get_uploaded_object_name(filename)
{
    return filename;
    // if (g_object_name_type == 'local_name')
    // {
    //     tmp_name = g_object_name
    //     tmp_name = tmp_name.replace("${filename}", filename);
    //     return tmp_name
    // }
    // else if(g_object_name_type == 'random_name')
    // {
    //     return g_object_name
    // }
}
function isOss(){
    result = false;
    try{
        oss_enable = document.getElementById("oss_enable").value;
        if(oss_enable == 1)
            result = true;
    }catch (e) {
        //oss_enable没有定义
    }
    return result;

}
//上传文件之前获，从服务器上获取rsId
function getServiceResourceByMd5(up,fileMd5,fileId) {
    $.ajax({
        url: contextPath+"/pub/pubresource/getAndCheckByMd5?utp="+urltype,//请求的action路径
        type:'POST',
        data:"rsMd5="+fileMd5,
        error:function () {//请求失败处理函数
            alert('操作失败');
        },
        success:function(data){ //请求成功后处理函数。
//            console.log('success:function ---:');
            var json = eval('(' + data + ')');
//            console.log(json);

            var temp = {}
            temp['filePath'] = json.filePath;
            temp['rsId'] = json.rsId;
            temp['rsMemo'] = json.rsMemo;
            temp['rsServerUrl'] = json.rsServerUrl;
            temp['rsMd5'] = fileMd5;

            fileHashMap.put(fileId,temp);
            //更新提交值
            var rsids = getRsID(fileHashMap);
            setInputValue('serviceLicenseRsid',rsids);


            if (json.status == "ok") {
                // alert("","操作成功！","success");
                if(json.rsMemo=='' || json.rsMemo==null) {
//                    console.log('---json.rsMemo--为空是新加--')
                    //文件加载，自动上传
                    set_upload_param(up, '', false);
                }else {
//                    console.log('---该文件已经存在。--')
                    //更新上状态
                    progressUpload('',fileId);
                    //已存在，从上传队例中删除,如果不删除下个文件上传的时候，会触发上传动作，plupload会把在它上传队列里的所有文件都上传。
                    up.removeFile( up.getFile(fileId));
                    //记录服务上存在过的文件
                    existServerFile.put(fileId,fileId);
                    
                }

            } else {
                alert("操作失败！"+json.message);
            }
        }
    });

}


function set_upload_param(up, file, ret)
{

    relativePath = '';
    if(file != ''){
        tempResource = fileHashMap.get(file.id);
        // console.log('----set_upload_param---');

        relativePath = tempResource.filePath;
        filename = file.name;
        suffix = get_suffix(filename)
        rsId = tempResource.rsId;
        //上传时修改文件名
        serviceFileName =  rsId + suffix;
        tempResource['rsSuffix'] = suffix;

        if(isOss()){
            // if (filename != '') { suffix = get_suffix(filename)
            calculate_object_name(serviceFileName)
            // }
            tempResource['rsMemo'] = g_object_name;
        }else {
            tempResource['rsMemo'] = relativePath+serviceFileName;
            g_object_name = serviceFileName;

        }

    }
    if(isOss()){
        if (ret == false)
        {
            ret = get_signature()
        }
    }
    set_upload_param_start(up,relativePath);
}

function set_upload_param_start(up,relativePath){
    new_multipart_params = {
        'key' : g_object_name,
        'policy': policyBase64,
        'OSSAccessKeyId': accessid,
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'callback' : callbackbody,
        'signature': signature
    };

    if(isOss()){
        up.setOption({
            'url': host,
            'multipart_params': new_multipart_params
        });
    }else {
        new_multipart_params = {
            'key' : g_object_name,
            'relativePath':relativePath
        };
        up.setOption({
            'url': contextPath+'/pub/pubresource/plupload',
            'multipart_params': new_multipart_params
        });
    }

    up.start();
}



$(function(){
    var str = '<div class="modal fade"  id="myModalpreview" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true" style="font-size:30px;">&times;</span></button></div><div class="modal-body text-center" id="img_show"><img src="" alt="" style="width:100%;" /></div><div class="modal-footer"></div></div></div></div>';
    $(document).find('body').append(str);
})

function handlepreview(id){
    var _id = '#btn'+ id;
    $('#img_show img').attr('src',$(_id).attr('src'));
    $('#myModalpreview').modal('show');
    $('#img_show img').load(function(){
        if($('#img_show img')[0].naturalWidth>$('#img_show img')[0].naturalHeight){
           $('#img_show img').css({'width': '100%',"height": 'auto'})
        }else{
           $('#img_show img').css({'height': $(window).height()-100,"width": 'auto'})
        }
    })
}

function getmd5(up,file,fileId){
    fileMd5 = '';
	var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
    //file = this.files[0],
    chunkSize = 2097152,                             // Read in chunks of 2MB
    chunks = Math.ceil(file.size / chunkSize),
    currentChunk = 0,
    spark = new SparkMD5.ArrayBuffer(),
    fileReader = new FileReader();

    fileReader.onload = function (e) {
//        console.log('read chunk nr', currentChunk + 1, 'of', chunks);
        spark.append(e.target.result);                   // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
            loadNext();
        } else {
            fileMd5 = spark.end();
            // fileHashMap.put(fileId,fileMd5);
            
            var pluploadFile =  up.getFile(fileId);
            //判断文件有没有重复上传
            if(limitRepeatFile.containsKey(fileMd5)){
            	
            	up.trigger("Error",{code:-602,message:"Duplicate file error.",file:pluploadFile});
            	up.removeFile(pluploadFile);
            	return true;
            }
            limitRepeatFile.put(fileMd5,fileId);
            
            
            document.getElementById('ossfile').innerHTML +=  '<li class="qq-file-id-1 qq-upload-success" qq-file-id="1" id="' + pluploadFile.id + '"><span role="status" class="qq-upload-status-text-selector qq-upload-status-text"></span>'+

                '<div class="uploadprogress" style="display:flex;"><div class="progress" style="width:100%;"><div class="progress-bar" style="width: 0%"></div></div><span></span></div>'
                // '<div class="qq-progress-bar-container-selector qq-progress-bar-container progress progressbar"><div role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" class="qq-progress-bar-selector qq-progress-bar progress-bar" style="width: 0%;"></div></div>'
                +'<div class="qq-thumbnail-wrapper"><img class="qq-thumbnail-selector previewImage" id="btn'+pluploadFile.id+'"  onclick="handlepreview(\''+pluploadFile.id+'\')"  src="" style="cursor: pointer;" /></div><div class="qq-file-info"><div class="qq-file-name"><span class="qq-upload-file-selector qq-upload-file" title="' + pluploadFile.name + '">' + pluploadFile.name + '</span><span class="qq-edit-filename-icon-selector qq-btn qq-edit-filename-icon" aria-label="编辑文件名"></span></div><input class="qq-edit-filename-selector qq-edit-filename" tabindex="0" type="text"><span class="qq-upload-size-selector qq-upload-size text-overflow-ellipsis">' + plupload.formatSize(pluploadFile.size) + '</span><button type="button" class="qq-btn qq-upload-delete-selector qq-upload-delete deletimgbtn" onclick="deleteImg(\''+pluploadFile.id+'\')" ><span class="qq-btn qq-delete-icon" aria-label="删除"></span></div></li>';
/*
            '<div class="containerDiv" id="' + pluploadFile.id + '">' + pluploadFile.name + ' (' + plupload.formatSize(pluploadFile.size) + ')<b></b>'
            +'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
            +'<div ><img src="'+contextPath+'/public/common/img/img_representation.png"></div>'
            +'<img class="closeDel" onclick="deleteImg(\''+pluploadFile.id+'\')" src="'+contextPath+'/public/plugins/ckeditor/skins/moono/images/close.png">'
            +'</div>';//*/
            
            
            
          //显示预览图片
            previewImage(pluploadFile, function(imgSrc) {

                var d = document.getElementById(pluploadFile.id);
                var _idname = '#'+ pluploadFile.id;
                // var imgdiv = d.getElementsByTagName('div')[2];
                //显示预览图
                // var i = d.getElementsByClassName('previewImage')[0];
                // i.attr("src", imgSrc);
                $('#'+ pluploadFile.id).find('.previewImage').attr("src", imgSrc);
                $('#img_show img').attr("src", imgSrc);
                //删除按钮
                var closeImg = $('#'+ pluploadFile.id).find('.deletimgbtn');
                
            });
            
            
            
            
            getServiceResourceByMd5(up,fileMd5,fileId);
//            console.log('finished loading');
//            console.info('computed hash', fileMd5);  // Compute hash
        }
    };

    fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
    };

    function loadNext() {
        var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();


}

function padleft0(obj) {
    return obj.toString().replace(/^[0-9]{1}$/, "0" + obj);
}
function getDateString(){
    nowtime = new Date();
    var year = nowtime.getFullYear();
    var month = padleft0(nowtime.getMonth() + 1);
    var day = padleft0(nowtime.getDate());
    return year+"/"+month+"/"+day;
}

//图片上传成功，更新到resource表
function updateResource(file) {

    updateData = fileHashMap.get(file.id);
    // console.log("-----updateResource------updateData:"+updateData.rsSuffix);

    if(file.name){
        fileNameByclearSuffix =  file.name.substr(0,file.name.indexOf(updateData.rsSuffix));
        updateData['rsTitle'] = fileNameByclearSuffix;
    }

    if(updateData.rsSuffix)
        updateData['rsSuffix'] = updateData.rsSuffix.substr(1);

    updateData['rsSize'] = file.size;
    // console.log(updateData);
    updateDataJson = JSON.stringify(updateData);
    // console.log(updateDataJson);


    $.ajax({
        url: contextPath+"/pub/pubresource/updateResource?utp="+urltype,//请求的action路径
        type:'POST',
        dataType:"json",
        contentType: 'application/json',
        data:updateDataJson,
        error:function () {//请求失败处理函数
            alert('操作失败');
        },
        success:function(data){ //请求成功后处理函数。
            // console.log(data);
            if (data.status == "ok") {
                alert("","操作成功！","success");
                // fileHashMap.remove(file.id);
            } else {
                alert("操作失败！"+data.message);
            }
        }
    });
}


function previewImage(file, callback) {//file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
    if (!file || !/image\//.test(file.type)) return; //确保文件是图片
    if (file.type == 'image/gif') {//gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
        var fr = new mOxie.FileReader();
        fr.onload = function () {
            callback(fr.result);
            fr.destroy();
            fr = null;
        }
        fr.readAsDataURL(file.getSource());
    } else {
        var preloader = new mOxie.Image();
        preloader.onload = function () {
            //preloader.downsize(550, 400);//先压缩一下要预览的图片,宽300，高300
            var imgsrc = preloader.type == 'image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
            callback && callback(imgsrc); //callback传入的参数为预览图片的url
            preloader.destroy();
            preloader = null;
        };
        preloader.load(file.getSource());
    }
}

function progressUpload(file,fileId){
    var d = document.getElementById(fileId);
    var percent = 100;
    if(file != '')
        percent = file.percent;

    $('#'+ fileId).find('.uploadprogress span').html(percent + "%");
    $('#'+ fileId).find('.progress .progress-bar').css('width',percent+'%');
    $('#'+ fileId).find('.progress').find('.progress-bar').attr('aria-valuenow',percent);
}

function getRsID(fileHashMap){
    var rsIDs = "";
    if(fileHashMap.values()){
        var arr = fileHashMap.values();
        for(var i= 0;i<arr.length;i++){
            rsIDs += arr[i]['rsId']+',';
        }
        rsIDs = rsIDs.substr(0,rsIDs.length-1);
        // console.log('----fileHashMap----rsIDs:'+rsIDs);
    }
    return rsIDs;

}

function setInputValue(id,values){
    if(values){
        if(values.charAt(values.length-1) ==',')
            values = values.substr(0,values.length-1);
    }
    document.getElementById(id).value = values;

//     console.log('-----setInputValue-----value:'+document.getElementById(id).value);

}

//删除预览图片
function deleteImg(fileid){
	var e = document.getElementById(fileid);
	document.getElementById("ossfile").removeChild(e);
	
//	console.log("---deleteImg---"+fileHashMap.size());
	//删除集合中的文件信息
	fileHashMap.remove(fileid);

	//删除重复队列 
	limitRepeatFile.remove(limitRepeatFile.containsValue(fileid));
//	console.log(fileHashMap.size());
	//服务器上已经存在的文件，不存在plupload上传队列。
	if(!existServerFile.containsKey(fileid))
		uploader.removeFile(uploader.getFile(fileid)); //这里把uploader定义为分局变量，只是临时 解决办法 。

    //更新提交值
    var rsids = getRsID(fileHashMap);
//	console.log("==rsids=="+rsids);
    setInputValue('serviceLicenseRsid',rsids);
}

function initDataplupload(value){
//    console.log('-----initDataplupload----'+value);
	 $.ajax({
	        url: contextPath+"/pub/pubresource/getfiles?utp="+urltype,//请求的action路径
	        type:'POST',
	        data:"fileIds="+value+"&params=0",
	        error:function () {//请求失败处理函数
	            alert('操作失败');
	        },
	        success:function(data){ //请求成功后处理函数。
	            var json = eval('(' + data + ')');
//	            console.log(json);
	            if(json.result==1){
	            	var list = json.ldata;

                    for(var j=0;j<list.length;j++){
                        var bean = list[j];
                                document.getElementById('ossfile').innerHTML +=  '<li class="qq-file-id-1 qq-upload-success" qq-file-id="1" id="' + bean.rsId + '"><span role="status" class="qq-upload-status-text-selector qq-upload-status-text"></span>'+
                              '<div class="uploadprogress" style="display:flex;"><div class="progress" style="width:100%;"><div class="progress-bar" style="width: 0%"></div></div><span></span></div>'
                              +'<div class="qq-thumbnail-wrapper"><img class="qq-thumbnail-selector previewImage" id="btn'+bean.rsId+'"  onclick="handlepreview(\''+bean.rsId+'\')" src="'+bean.rsServerUrl+bean.rsMemo+'" style="cursor: pointer;"></div><div class="qq-file-info"><div class="qq-file-name"><span class="qq-upload-file-selector qq-upload-file" title="' + bean.rsTitle + '">' + bean.rsTitle + '</span><span class="qq-edit-filename-icon-selector qq-btn qq-edit-filename-icon" aria-label="编辑文件名"></span></div><input class="qq-edit-filename-selector qq-edit-filename" tabindex="0" type="text"><span class="qq-upload-size-selector qq-upload-size text-overflow-ellipsis">' + plupload.formatSize(bean.rsSize) + '</span><button type="button" class="qq-btn qq-upload-delete-selector qq-upload-delete deletimgbtn" onclick="deleteImg(\''+bean.rsId+'\')" ><span class="qq-btn qq-delete-icon" aria-label="删除"></span></div></li>';


                                limitRepeatFile.put(bean.rsMd5,bean.rsId);
                                //记录服务上存在过的文件
                                existServerFile.put(bean.rsId,bean.rsId);

                                var temp = {}
                                temp['filePath'] = '';
                                temp['rsId'] = bean.rsId;
                                temp['rsMemo'] = bean.rsMemo;
                                temp['rsServerUrl'] = bean.rsServerUrl;
                                temp['rsMd5'] = bean.rsMd5;

                                fileHashMap.put(bean.rsId,temp);
                    }

//                    var rsids = getRsID(fileHashMap);
//                    setInputValue(objs.id,rsids);
	            	
	            }
	               
	        }
	    });
}



$(function () {
	//控件初始化。
	var objs = document.getElementsByClassName("newCommonUpload");
    for (var i = 0; i < objs.length; i++) {
      //设置每个元素的背景颜色
//    	console.log('-----控件初始化-----');
//    	console.log(objs[i].value);
    	if(objs[i].value)
    		initDataplupload(objs[i].value);
    	
    	//为每个上传控件添加change事件

    	$("#"+objs[i].id).change(function(){
    		document.getElementById('ossfile').innerHTML="";
    		
    		var text = $(this).val();
    		limitRepeatFile.clear();
    		existServerFile.clear();
    		fileHashMap.clear();
//    		console.log(text);
    		if(text)
    			initDataplupload(text);
    		
    	});

    	
    	
    }

    if(isOss())
        finallyServerUrl = 'http://oss.aliyuncs.com';
    else
        finallyServerUrl = contextPath+'/pub/pubresource/plupload';

    uploader = new plupload.Uploader({
        runtimes : 'html5,flash,silverlight,html4',
        browse_button : 'selectfiles',
        //multi_selection: false,
        container: document.getElementById('container'),
        flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
        silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
        url : finallyServerUrl,
        drop_element: document.getElementById('ossfile'),
        filters: {
            mime_types : [ //只允许上传图片和zip文件
                { title : "Image files", extensions : "jpg,gif,png,bmp" },
                { title : "Zip files", extensions : "zip,rar" }
            ],
            max_file_size : '10mb', //最大只能上传10mb的文件
            prevent_duplicates : true //不允许选取重复文件
        },

        init: {
            PostInit: function() {
                document.getElementById('ossfile').innerHTML = '';
                //点击选择上传文件 。
//                document.getElementById('postfiles').onclick = function() {
//
//                    set_upload_param(uploader, '', false);
//
//                    return false;
//                };
            },

            FilesAdded: function(up, files) {
                plupload.each(files, function(file) {

                    // document.getElementById('ossfile').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
                    //     +'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
                    //     +'</div>';

//                    console.log('FilesAdded  --file.id:'+file.id);
                   
                    $('#console').html('');
                    getmd5(up,file.getNative(),file.id);
                    

                });
                // set_upload_param(up, '', false);

            },

            BeforeUpload: function(up, file) {
                // check_object_radio();
                set_upload_param(up, file, true);
            },

            UploadProgress: function(up, file) {
                progressUpload(file,file.id);


            },
            FileUploaded: function(up, file, info) {
                if (info.status == 200)
                {

                    // document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = 'upload to oss success, object name:' + get_uploaded_object_name(file.name) + ' 回调服务器返回的内容是:' + info.response;
//                    $('#console').html(info.response);
                    // document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML =  info.response;
                    updateResource(file);

                }
                else if (info.status == 203)
                {
                    $('#console').html('上传到OSS成功，但是oss访问用户设置的上传回调服务器失败，失败原因是:' + info.response);
                }
                else
                {
                   $('#console').html(info.response);
                }
            },

            Error: function(up, err) {
                if (err.code == -600) {
                    document.getElementById('console').appendChild(document.createTextNode("\n选择的文件太大了,可以根据应用情况，在upload.js 设置一下上传的最大大小"));
                }
                else if (err.code == -601) {
                    document.getElementById('console').appendChild(document.createTextNode("\n选择的文件后缀不对,可以根据应用情况，在upload.js进行设置可允许的上传文件类型"));
                }
                else if (err.code == -602) {
                    document.getElementById('console').appendChild(document.createTextNode("\n这个文件已经上传过一遍了"));
                }
                else
                {
                    document.getElementById('console').appendChild(document.createTextNode("\nError xml:" + err.response));
                }
            }
        }
    });

    uploader.init();

});


function HashMap(){
    //定义长度
    var length = 0;
    //创建一个对象
    var obj = new Object();

    /**
     * 判断Map是否为空
     */
    this.isEmpty = function(){
        return length == 0;
    };

    /**
     * 判断对象中是否包含给定Key
     */
    this.containsKey=function(key){
        return (key in obj);
    };

    /**
     * 判断对象中是否包含给定的Value
     */
    this.containsValue=function(value){
        for(var key in obj){
            if(obj[key] == value){
                return key;
            }
        }
        return false;
    };

    /**
     *向map中添加数据
     */
    this.put=function(key,value){
        if(!this.containsKey(key)){
            length++;
        }
        obj[key] = value;
    };

    /**
     * 根据给定的Key获得Value
     */
    this.get=function(key){
        return this.containsKey(key)?obj[key]:null;
    };

    /**
     * 根据给定的Key删除一个值
     */
    this.remove=function(key){
        if(this.containsKey(key)&&(delete obj[key])){
            length--;
        }
    };

    /**
     * 获得Map中的所有Value
     */
    this.values=function(){
        var _values= new Array();
        for(var key in obj){
            _values.push(obj[key]);
        }
        return _values;
    };

    /**
     * 获得Map中的所有Key
     */
    this.keySet=function(){
        var _keys = new Array();
        for(var key in obj){
            _keys.push(key);
        }
        return _keys;
    };

    /**
     * 获得Map的长度
     */
    this.size = function(){
        return length;
    };

    /**
     * 清空Map
     */
    this.clear = function(){
        length = 0;
        obj = new Object();
    };
}
