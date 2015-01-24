package it.unipi.iot;

import org.eclipse.californium.core.*;

public class CoapNode {
	String address;
	CoapResource resource;
	
	public CoapNode(String address, CoapResource resource) {
		this.address = address;
		this.resource = resource;
	}

	public CoapNode(String address) {
		this.address = address;
	}
	
	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public CoapResource getResource() {
		return resource;
	}

	public void setResource(CoapResource resource) {
		this.resource = resource;
	}
}
