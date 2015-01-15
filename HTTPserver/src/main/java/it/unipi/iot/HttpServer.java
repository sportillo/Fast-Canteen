package it.unipi.iot;

import java.io.StringReader;


import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonValue;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.eclipse.californium.core.CoapClient;
import org.eclipse.californium.core.CoapHandler;
import org.eclipse.californium.core.CoapResource;
import org.eclipse.californium.core.CoapResponse;
import org.eclipse.californium.core.CoapServer;
import org.eclipse.californium.core.coap.MediaTypeRegistry;
import org.eclipse.californium.core.coap.Response;
import org.eclipse.californium.core.coap.CoAP.ResponseCode;
import org.eclipse.californium.core.network.config.NetworkConfig;
import org.eclipse.californium.core.server.resources.CoapExchange;
import org.eclipse.californium.proxy.DirectProxyCoAPResolver;
import org.eclipse.californium.proxy.ProxyHttpServer;
import org.eclipse.californium.proxy.resources.ForwardingResource;
import org.eclipse.californium.proxy.resources.ProxyCoapClientResource;
import org.eclipse.californium.proxy.resources.ProxyHttpClientResource;
import org.json.JSONException;
import org.json.JSONObject;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
/**
 * Http2CoAP: Insert in browser:
 *     URI: http://localhost:8080/proxy/coap://localhost:PORT/target
 */


public class HttpServer {
	
	
	static Socket socket;
	
	private static final int PORT = NetworkConfig.getStandard().getInt(NetworkConfig.Keys.COAP_PORT);

	private CoapServer targetServerA;
	
	static public Canteen cammeo = new Canteen("Cammeo");
	static public Canteen martiri = new Canteen("Martiri");
	static CoapHandler handler = new CoapHandler() {
		
		@Override
		public void onLoad(CoapResponse response) {
			if(response.getResponseText().charAt(0) != 'A') {
				JsonReader reader = Json.createReader(new StringReader(response.getResponseText()));
				JsonObject object = reader.readObject();
				String canteen  = object.getString("bn");
				JsonArray array = object.getJsonArray("e");
				JsonObject measure = array.getJsonObject(0);
				String type = measure.getString("n");
				int nodeId = Integer.parseInt(measure.getString("id"));
				if (type.equals("seat")) {
					int value = Integer.parseInt(measure.getString("bv"));
					JSONObject obj = new JSONObject();
					try {
						obj.put("canteen", canteen);
						obj.put("type", type);
						obj.put("id", nodeId);
						obj.put("value", value);
						socket.emit("update.seat", obj);
						System.out.println(response.getResponseText());
					} catch (JSONException e) {
						e.printStackTrace();
					}
				} else if(type.equals("temperature")) {
					float value = Float.parseFloat(measure.getString("v"));
					JSONObject obj = new JSONObject();
					try {
						obj.put("canteen", canteen);
						obj.put("type", type);
						obj.put("id", nodeId);
						obj.put("value", value);
						socket.emit("update.temperature", obj);
						System.out.println(response.getResponseText());
					} catch (JSONException e) {
						e.printStackTrace();
					}
				} else if (type.equals("queue")) {
					int value = Integer.parseInt(measure.getString("bv"));
					JSONObject obj = new JSONObject();
					try {
						obj.put("canteen", canteen);
						obj.put("type", type);
						obj.put("id", nodeId);
						obj.put("value", value);
						socket.emit("update.queue", obj);
						System.out.println(response.getResponseText());
					} catch (JSONException e) {
						e.printStackTrace();
					}
				}
				
				/* Persistent Layer ??? */
				//for(CoapNode node : cammeo.getNodes()) {
				//	if(node.getId() == nodeId){
				//		node.setValue(value);		
				//	}
				//}
				
			}
		}
		
		@Override
		public void onError() {
			// TODO Auto-generated method stub
			
		}
	};
	
	private void initSocketIO() throws Exception{
		socket = IO.socket("http://192.168.1.10:8080");
		socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {

			  @Override
			  public void call(Object... args) {
				  
			  }

			}).on("event", new Emitter.Listener() {

			  @Override
			  public void call(Object... args) {}

			}).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {

			  @Override
			  public void call(Object... args) {}

			});
			socket.connect();
			
			System.out.println("Socket.IO Connected");
	}
	
	private void observeResources(){
		for(CoapNode node : cammeo.getNodes()){
			CoapClient resourceClient = new CoapClient(node.getAddress()+node.getResource().getPath());
			resourceClient.observe(handler);
		}
	}
	
	private CoapResource parseLinkFormat(String lf) {
		CoapResource res = new CoapResource(lf.substring(lf.indexOf("title=\"")+7, lf.indexOf("\"",lf.indexOf("title=\"")+7)));
		res.setPath(lf.substring(lf.indexOf('<', 2)+1, lf.indexOf('>', lf.indexOf('<', 2))));
		return res;
		
	}
	
	private void collectNodes(){
	try {
	    HttpClient client = new DefaultHttpClient();
	    HttpGet request = new HttpGet("http://[aaaa::212:7401:1:101]");
	    HttpResponse response = client.execute(request);
	    HttpEntity entity = response.getEntity();
	    String content = EntityUtils.toString(entity);
		JsonReader reader = Json.createReader(new StringReader(content));
		JsonArray array = reader.readArray();
		
		System.out.println(array.size());

		for(JsonValue value : array) {
        	String address = value.toString().replace("\"", "");
        	CoapNode node = new CoapNode("coap://["+address+"]");
			CoapClient resourceClient = new CoapClient(node.getAddress()+"/.well-known/core");
			System.out.println(address);
			CoapResponse resp = resourceClient.get();
			String rsp = resp.getResponseText();
			CoapResource res = parseLinkFormat(rsp);
			node.setResource(res);
			//int nodeID = Integer.parseInt(rsp.substring(rsp.indexOf("id=\"")+4, rsp.indexOf("\";", rsp.indexOf("id=\""))));
			//node.setId(nodeID);
        	cammeo.addNode(node);
        }
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public HttpServer() throws Exception {
		ForwardingResource coap2coap = new ProxyCoapClientResource("coap2coap");
		ForwardingResource coap2http = new ProxyHttpClientResource("coap2http");
		
		// Create CoAP Server on PORT with proxy resources form CoAP to CoAP and HTTP
		targetServerA = new CoapServer(PORT);
		targetServerA.add(coap2coap);
		targetServerA.add(coap2http);
		targetServerA.add(new TargetResource("canteen"));
		targetServerA.start();
		
		ProxyHttpServer httpServer = new ProxyHttpServer(8080);
		httpServer.setProxyCoapResolver(new DirectProxyCoAPResolver(coap2coap));
		
		System.out.println("CoAP resource \"target\" available over HTTP at: http://localhost:8080/proxy/coap://localhost:PORT/target");
		System.out.println("Socket.IO init...");
		initSocketIO();
		System.out.println("Discovering nodes...");
		collectNodes();
		System.out.println("Observing resources...");
		observeResources();
		System.out.println("Ready!");
	}
	
	/**
	 * A simple resource that responds to GET requests with a small response
	 * containing the resource's name.
	 */
	private static class TargetResource extends CoapResource {
		
		public TargetResource(String name) {
			super(name);
		}
		
		@Override
		public void handleGET(CoapExchange exchange) {
			
			System.out.println(exchange.getSourceAddress().getHostAddress().toString());
			System.out.println(exchange.getSourcePort());
		
	        JsonArrayBuilder sensors = Json.createArrayBuilder();
			for(CoapNode node : cammeo.getNodes()){

	        	sensors.add(Json.createObjectBuilder()
	        			.add("ID", node.getId())
	        			.add("Value", node.getValue())
	        			.build());
	

			}
			JsonObject obj = Json.createObjectBuilder().add("Canteen", cammeo.getName()).add("Sensors", sensors).build();
    		Response r = new Response(ResponseCode.CONTENT);
    		r.setPayload(obj.toString());
    		r.getOptions().setContentFormat(MediaTypeRegistry.APPLICATION_JSON);
    		exchange.respond(r);


	}
	}
	
	public static void main(String[] args) throws Exception {
		new HttpServer();
	}

}
