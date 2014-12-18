#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include <stdio.h>
#include <string.h>

RESOURCE(PlugStatus, METHOD_POST, "status", "title=\"Plug status\"");

uint8_t plug_status = 0;

PROCESS(server, "Plug Server Process");
AUTOSTART_PROCESSES(&server);

void PlugStatus_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  uint8_t method = REST.get_method_type(request);
  const char *status;
  
  if(method & METHOD_POST)
  {
    REST.get_post_variable(request, "status", &status);
    
    if (status[0] == '0')
      plug_status = 0;
    else if (status[0] == '1')
      plug_status = 1;
    
    printf("Status: %d\n", plug_status);
    
    REST.set_response_status(response, REST.status.CREATED);
  } 
}

PROCESS_THREAD(server, ev, data)
{
  PROCESS_BEGIN();
  
  rest_init_engine();
  rest_activate_resource(&resource_PlugStatus);
  
  while(1)
  {
    PROCESS_WAIT_EVENT();
  }

  PROCESS_END();
}