#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include <stdio.h>
#include <string.h>
#include "random.h"

PERIODIC_RESOURCE(GetTemp, METHOD_GET, "temp", "title=\"Temperature\";obs", 5*CLOCK_SECOND);

uint8_t id;
float   curr_temp = 0.f;
uint16_t counter = 1;

PROCESS(server, "Temperature Process");
AUTOSTART_PROCESSES(&server);

void GetTemp_periodic_handler(resource_t *r)
{
  coap_packet_t notification[1];
  char buff[256];
  int new_temp;
  //int integer, fract;

  new_temp = random_rand();
  new_temp = (int)new_temp % 2;
  curr_temp = curr_temp + 0.1f * new_temp;
  coap_init_message(notification, COAP_TYPE_NON, REST.status.OK, 0);  
  coap_set_payload(notification, buff, snprintf(buff, sizeof(buff), "{\"bn\":\"martiri\",\"e\":[{\"n\":\"temperature\",\"id\":\"%d\",\"u\":\"Cel\",\"v\":\"%d.%d\"}]}", id, (int)curr_temp, ((int) (curr_temp * 10)) % 10));
  printf("%s\n", buff);
  REST.set_header_content_type(notification, REST.type.APPLICATION_JSON);
  REST.notify_subscribers(r, counter, notification);
  counter++;
}

void GetTemp_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  char buff[128];
  
  if(REST.get_method_type(request) & METHOD_GET)
  {
    int length = sprintf(buff, "{\"bn\":\"cammeo\",\"e\":[{\"n\":\"temperature\",\"id\":\"%d\",\"u\":\"Cel\",\"v\":\"%d.%d\"}]}", id, (int)curr_temp, ((int) (curr_temp * 10)) % 10);
    memcpy(buffer, buff, length);
    REST.set_header_content_type(response, REST.type.APPLICATION_JSON);
    REST.set_header_etag(response, (uint8_t*)&length, 1);
    REST.set_response_payload(response, buffer, length);
  }
}


PROCESS_THREAD(server, ev, data)
{
  PROCESS_BEGIN();
  random_init(23);
  id = random_rand();
  id = id % 200;
  curr_temp = random_rand();
  curr_temp = abs((int)curr_temp % 30);
  rest_init_engine();
  rest_activate_periodic_resource(&periodic_resource_GetTemp);
  
  while(1)
  {
    PROCESS_WAIT_EVENT();
  }

  PROCESS_END();
}
