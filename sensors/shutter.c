#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include "dev/leds.h"
#include "dev/button-sensor.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

uint8_t level = 0;

RESOURCE(Resource1, METHOD_POST, "status", "title=\"Shutter status\"");

PROCESS(server, "CoAP Shutter");
AUTOSTART_PROCESSES(&server);

void Resource1_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  int length = 100;
  uint8_t method = REST.get_method_type(request);
  
  if(method & METHOD_POST)
  {
    const char *post_var_str;
    REST.get_post_variable(request, "level", &post_var_str);
    level = atoi(post_var_str);
    //printf("level: %d\n", level);
    REST.set_response_status(response, REST.status.CREATED);
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