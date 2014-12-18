#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include "dev/leds.h"
#include <stdio.h>
#include <string.h>


RESOURCE(Resource1, METHOD_GET | METHOD_POST, "leds", "title=\"Leds\", rt=\"text\"");

PROCESS(server, "CoAP Server Process");
AUTOSTART_PROCESSES(&server);
void Resource1_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  uint8_t method = REST.get_method_type(request);
  const char *color;
  const char *value;
  uint8_t leds = 0;
  int len = 20;
  
  if(method & METHOD_POST)
  {
    REST.set_response_status(response, REST.status.CREATED);
    REST.get_post_variable(request, "led", &color);
    if (strstr(color, "r")!=NULL)
      leds |= LEDS_RED;
    if (strstr(color, "g")!=NULL)
      leds |= LEDS_GREEN;
    if (strstr(color, "b")!=NULL)
      leds |= LEDS_BLUE;
    
    REST.get_post_variable(request, "value", &value);
    
    if (strncmp(value, "on", len))
      leds_on(leds);
    else if(strncmp(value, "off", len))
      leds_off(leds);
  } 
    else 
  {
    
  value = "200OK";
  memcpy(buffer, value, len);
  int length = len;
  
  REST.set_header_content_type(response, REST.type.TEXT_PLAIN);
  REST.set_header_etag(response, (uint8_t*)&length, 1);
  REST.set_response_payload(response, buffer, length);

  }
}

PROCESS_THREAD(server, ev, data)
{
  PROCESS_BEGIN();
  rest_init_engine();
  rest_activate_resource(&resource_Resource1);

  while(1)
  {
    PROCESS_WAIT_EVENT();
  }

  PROCESS_END();
}