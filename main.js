function requestAjax(url, type, data = ""){
  const dataType = 'json';

  if(type == "POST"){
    return $.ajax({
      type,
      dataType,
      url,
      data
    })
  }else if(type == "GET"){
    return $.ajax({
      type,
      dataType,
      url,
      data
    })
  }
};

function getNumber(){
  return document.getElementById("number").value;
}
function getReceiver(){
  return document.getElementById("receiver").value;
}

function load(){
  const numberForm = document.getElementById("number");
  const receiverForm = document.getElementById("receiver");
  numberForm.value = "";
  receiverForm.value = "";
}

function accountRegister(){
  const alias = getNumber();
  const timestamp = Date.now();

  if(localStorage.getItem(alias) !== null){
    console.log("This user exists");
    return false;
  }
  const keys = iroha.createKeyPair();
  const publicKey = keys.publicKey;
  const privateKey = keys.privateKey;

  const params = {
    publicKey,
    alias,
    timestamp
  };

  requestAjax('http://45.76.148.248:80/account/register','POST',JSON.stringify(params)).done((result) => {
    const userInfo = {
      publicKey,
      privateKey,
      uuid: result.uuid
    }
    localStorage.setItem(alias,JSON.stringify(userInfo));
    return result;
  })
}

function getMyAccount(){
  const alias = getNumber();
  const userInfo = JSON.parse(localStorage.getItem(alias))
  console.log(userInfo);
  const uuidParams = {uuid: userInfo.uuid};
  return requestAjax('http://45.76.148.248:80/account', 'GET' ,uuidParams).done((response) => {
    console.log(response);
    return response;
  });
}

function getMyHistory(){
  const alias = getNumber();
  const uuidParams = {uuid: JSON.parse(localStorage.getItem(alias)).uuid};
  return requestAjax('http://45.76.148.248:80/history/transaction', 'GET' ,uuidParams).done((response) => {
    console.log(response);
    return response;
  });
}

function execCom(){
  const alias = getNumber();
  const receiver = getReceiver();

  const receiverInfo = JSON.parse(localStorage.getItem(receiver));
  const userInfo = JSON.parse(localStorage.getItem(alias));

  getMyAccount().done((response) => {
    userInfo.assets = response.assets;

    const signature = iroha.sign({
      publicKey: userInfo.publicKey,
      privateKey:userInfo.privateKey,
      message: "コマンド実行やで"
    });

    const commandParams = JSON.stringify({
      "asset-uuid": userInfo.assets[0]["asset-uuid"],
      params: {
        command: "transfer",
        value: "23",
        sender: userInfo.publicKey,
        receiver: receiverInfo.publicKey
      },
      signature: signature,
      timestamp: Date.now()
    })
    console.log(commandParams);
    return requestAjax('http://45.76.148.248:80/asset/operation', 'POST' ,commandParams).done((response) => {
      console.log(response);
      return response;
    })
  })
}

//俺のアカウント & 魔法の呪文
function fire(){
  load();
  // localStorage.clear();
  const shushi = "8706000003114089";
  localStorage.setItem(shushi,"8e3ecef927580475e5e0bea4536c475c4869bcc129fd3173e117e0da66ac294c");
  console.log(localStorage.getItem(shushi));
}
