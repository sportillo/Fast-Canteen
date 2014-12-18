#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include <stdio.h>
#include <string.h>
#include "random.h"

RESOURCE(GetStatus, METHOD_GET, "status", "title=\"Seat Status\"");

uint8_t id = 0;
uint8_t status = 1;

PROCESS(server, "Seat process");
AUTOSTART_PROCESSES(&server);


void GetStatus_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  uint8_t method = REST.get_method_type(request);
  char buff[128];
  
  if(method & METHOD_GET)
  {
    status = random_rand() % 2;
    int length = sprintf(buff, "{\"e\":[{\"n\":\"Seat%d\",\"bv\":\"%d\"}]}", id, status);
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
  rest_activate_resource(&resource_GetStatus);
  
  while(1)
  {
    PROCESS_WAIT_EVENT();
    /* TODO: function that check the seat */
  }

  PROCESS_END();
}
