const ipfsGateway = 'https://moccasin-accused-cougar-270.mypinata.cloud/ipfs/';

const getIpfsContent = async (cid: string): Promise<string> => {
	const res = await fetch(`${ipfsGateway}${cid}`);
	const s = await res.json();
	return s;
};

export { getIpfsContent };
