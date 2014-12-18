#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include <stdio.h>
#include <string.h>

RESOURCE(GetTemp, METHOD_GET, "temp", "title=\"Temperature\"");

uint8_t id = 0;
uint8_t curr_temp = 17;

PROCESS(server, "Temperature Server Process");
AUTOSTART_PROCESSES(&server);

void GetTemp_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  uint8_t method = REST.get_method_type(request);
  char buff[128];
  
  if(method & METHOD_GET)
  {
    int length = sprintf(buff, "{\"e\":[{\"n\":\"Temp%d\",\"u\":\"Cel\",\"v\":\"%d\"}]}", id, curr_temp);
    memcpy(buffer, buff, length);
    
    REST.set_header_content_type(response, REST.type.APPLICATION_JSON);
    REST.set_header_etag(response, (uint8_t*)&length, 1);
    REST.set_response_payload(response, buffer, length);
  } 
}

PROCESS_THREAD(server, ev, data)
{
  PROCESS_BEGIN();
  
  rest_init_engine();
  rest_activate_resource(&resource_GetTemp);
  
  while(1)
  {
    PROCESS_WAIT_EVENT();
  }

  PROCESS_END();
}