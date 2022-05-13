import React, { useEffect, useState } from "react";
import { Card, Upload, Input, InputNumber, Space, Button, } from "antd";
import Account from "./Account";
import { useContractLoader } from "../hooks";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Buffer } from 'buffer';
import * as ipfsClient from "ipfs-http-client";


const DEFAULT_CONTRACT_NAME = "NFTMinter";
const projectId = '292mcpNSrFKS7E6kKTLbxSXK3nO';
const projectSecret = '36803bc3cf862b98f8cbdc6a01e13676';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

export default function UploadImage({
    customContract,
    account,
    gasPrice,
    signer,
    provider,
    name,
    price,
    blockExplorer,
}) {
    const [file, setFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [uploadIpfs, setUploadIpfs] = useState(null);
    const [ipfs, setIpfs] = useState(null);
    const [fileHash, setFileHash] = useState(null);
    const [status, setStatus] = useState("");



    if (!name) {
        name = DEFAULT_CONTRACT_NAME;
    }
    const contracts = useContractLoader(provider);
    let contract;
    if (!customContract) {
        contract = contracts ? contracts[name] : "";
        } else {
        contract = customContract;
    }
    
    const address = contract ? contract.address : "";
    const preview = previewURL ? <img src={previewURL} style={{maxWidth: "800px"}}/> : <div/>

    const connect = async () => {
        try {
            const client = await ipfsClient.create({
                host: 'ipfs.infura.io',
                port: 5001,
                protocol: 'https',
                headers: {
                    authorization: auth,
                },
            });
            setIpfs(client);
        }
        catch(err) {
          console.log(err.message)
        }
    }

    const saveToIpfs = async() => {
        try {
            const client = await ipfsClient.create({
                host: 'ipfs.infura.io',
                port: 5001,
                protocol: 'https',
                headers: {
                    authorization: auth,
                },
            });

            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            console.log('added', added);
            setFileHash(added.cid.toString())
        } catch (err) {
            console.log(err.message)
        }
    }
    
    const beforeUpload = (file, fileList) => {
        console.log(file, fileList);
        setFile(file);
        setPreviewURL(URL.createObjectURL(file));
        return false;
    }
    
    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>
                Choose image
            </div>
        </div>
    );
    
    const uploadView = (
    <div>
        Drop an image file or click below to select.
        <Upload
            name="avatar"
            accept=".jpeg,.jpg,.png,.gif"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            beforeUpload={beforeUpload}
            >
            {uploadButton}
        </Upload>
    </div>
    );
    
    const uploadEnabled = file != null;

    const startUploadingIpfs = async() => {
        console.log('Uploading Images to IPFS');
        await connect();
        await saveToIpfs();
        setUploadIpfs(true);
    }


    const uploadIpfsBtn = (
        <Button type="primary" disabled={!uploadEnabled} onClick={startUploadingIpfs}>
          {uploadIpfs ? <LoadingOutlined/> : "Upload!"}
        </Button>
    )

    return (
        <div style={{ margin: "auto", width: "70vw" }}>
            <Card
                title={
                <div>
                    Add images metadata
                    <div style={{ float: "right" }}>
                    <Account
                        address={address}
                        localProvider={provider}
                        injectedProvider={provider}
                        mainnetProvider={provider}
                        price={price}
                        blockExplorer={blockExplorer}
                    />
                    {account}
                    </div>
                </div>
                 }
                size="large"
                style={{ marginTop: 25, width: "100%" }}
                loading={false}
            >
                <Space>
                { file == null && uploadView }
                {preview}
                {uploadIpfsBtn}
                </Space>
            </Card>
        </div>
    );
    
}