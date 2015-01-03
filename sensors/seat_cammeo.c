#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include <stdio.h>
#include <string.h>
#include "random.h"

//char title[100];

PERIODIC_RESOURCE(GetStatus, METHOD_GET, "status", "title=\"Seat\";obs", 5*CLOCK_SECOND);

uint8_t id;
uint8_t status = 0;
uint16_t counter = 1;

PROCESS(server, "Seat process");
AUTOSTART_PROCESSES(&server);

void GetStatus_periodic_handler(resource_t *r)
{
  status = random_rand();
  status = status % 2;
  coap_packet_t notification[1];
  char content[256];

  coap_init_message(notification, COAP_TYPE_NON, REST.status.OK, 0 );  
  coap_set_payload(notification, content, snprintf(content, sizeof(content), "{\"bn\":\"cammeo\",\"e\":[{\"n\":\"seat\",\"id\":\"%d\",\"bv\":\"%d\"}]}", id, status));
  printf("%s\n", content);
  REST.set_header_content_type(notification, REST.type.APPLICATION_JSON);
  REST.notify_subscribers(r, counter, notification);
  counter++;
}

void GetStatus_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  uint8_t method = REST.get_method_type(request);
  char buff[128];
  
  if(method & METHOD_GET)
  {
    int length = sprintf(buff, "{\"bn\":\"cammeo\",\"e\":[{\"n\":\"seat\",\"id\":\"%d\",\"bv\":\"%d\"}]}", id, status);
    memcpy(buffer, buff, length);

    REST.set_header_content_type(response, REST.type.APPLICATION_JSON);
    REST.set_header_etag(response, (uint8_t*)&length, 1);
    REST.set_response_payload(response, buffer, length);
  } 
}

PROCESS_THREAD(server, ev, data)
{
  PROCESS_BEGIN();
  id = random_rand() % 200;
  //sprintf(title, "title=\"Seat\";id=\"%d\";obs", id);
  rest_init_engine();
  rest_activate_periodic_resource(&periodic_resource_GetStatus);

  while(1)
  {
    PROCESS_WAIT_EVENT();
    /* TODO: function that check the seat */
  }

  PROCESS_END();
}
