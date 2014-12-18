#include "contiki.h"
#include "contiki-net.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "erbium.h"
#include "dev/button-sensor.h"
#include "er-coap-13.h"

static int intensity = 250;

RESOURCE(light_sensor, METHOD_GET, "light", "title=\"Light Sensor\"");

void light_sensor_handler(void* request, void* response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset){
  
  int length;
  
  char message[100];
  sprintf(message,"{\"e\":[{ \"n\": \"a1_light_sensor\", \"u\": \"lx\", \"v\": %d } ]}", intensity);
  
  length = strlen(message);
  
  memcpy(buffer, message, length);

  REST.set_header_content_type(response, REST.type.APPLICATION_JSON); 
  REST.set_header_etag(response, (uint8_t *) &length, 1);
  REST.set_response_payload(response, buffer, length);
}

PROCESS(server, "CoAP Light Sensor");
AUTOSTART_PROCESSES(&server);

PROCESS_THREAD(server, ev, data){
  
PROCESS_BEGIN();
//SENSORS_ACTIVATE(button_sensor);
rest_init_engine();
rest_activate_resource(&resource_light_sensor);

while(1) {
  PROCESS_WAIT_EVENT();
}
PROCESS_END();
}