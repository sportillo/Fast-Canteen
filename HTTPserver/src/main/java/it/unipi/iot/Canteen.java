package it.unipi.iot;

import java.util.ArrayList;

public class Canteen {
	
	String name;
	ArrayList<CoapNode> nodes;
	
	public Canteen(String name){
		this.name = name;
		this.nodes = new ArrayList<CoapNode>();
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public ArrayList<CoapNode> getNodes() {
		return nodes;
	}

	public void setNodes(ArrayList<CoapNode> nodes) {
		this.nodes = nodes;
	}
	
	public void addNode(CoapNode node) {
		this.nodes.add(node);
	}

}
