#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include "dev/leds.h"
#include "dev/button-sensor.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

uint8_t status = 0;

RESOURCE(Resource1, METHOD_GET | METHOD_POST, "status", "title=\"Projector status\"");

PROCESS(server, "CoAP Projector");
AUTOSTART_PROCESSES(&server);

void Resource1_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  int length = 100;
  uint8_t method = REST.get_method_type(request);
  
  if(method & METHOD_POST)
  {
    const char *post_var_str;
    REST.get_post_variable(request, "status", &post_var_str);
    if(post_var_str[0] == '1')
      status = 1;
    else
      status = 0;
    REST.set_response_status(response, REST.status.CREATED);
  } 
  else if(method & METHOD_GET)
  {
    length = sprintf(buffer, "{\"e\":{[\"n\":\"Projector\",\"bv\":\"%d\"}]}", status);
    REST.set_header_content_type(response, REST.type.APPLICATION_JSON);
    REST.set_header_etag(response, (uint8_t*)&length, 1);
    REST.set_response_payload(response, buffer, length);
  }
}


PROCESS_THREAD(server, ev, data)
{
  PROCESS_BEGIN();
  //SENSORS_ACTIVATE(button_sensor);
  rest_init_engine();
  rest_activate_resource(&resource_Resource1);
  
  while(1)
  {
    PROCESS_WAIT_EVENT();
  }

  PROCESS_END();
}