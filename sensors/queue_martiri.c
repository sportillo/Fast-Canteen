#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include <stdio.h>
#include <string.h>
#include "random.h"

#define MAX_LEN 10
#define PPL_METER 20

PERIODIC_RESOURCE(GetStatus, METHOD_GET, "status", "title=\"Queue\";obs", 15 * CLOCK_SECOND);

uint8_t id = 0;
uint8_t queueLength = 0;
uint8_t peopleInFirstMeter = PPL_METER;
uint16_t counter = 1;

PROCESS(server, "Queue process");
AUTOSTART_PROCESSES(&server);

void GetStatus_periodic_handler(resource_t *r)
{
  uint8_t seed = random_rand() % 256;
  
  /* Every 15 seconds, a person is processed */
  /* If there are people left in the queue */
  if (queueLength > 0 && peopleInFirstMeter > 0)
  {
    /* Decrement */
    peopleInFirstMeter--;
    if (peopleInFirstMeter == 0)
    {
      queueLength--;
      if (queueLength > 0)
	peopleInFirstMeter = PPL_METER;
    }
  }
  
  /* Occasionally new people arrive */
  if (seed > 210)
  {
    int newPeople = random_rand() % 5;
    
    if (peopleInFirstMeter + newPeople > PPL_METER)
    {
      peopleInFirstMeter = PPL_METER;
      queueLength = (queueLength + 1 > MAX_LEN) ? MAX_LEN : queueLength + 1;
    }
    else
    {
      peopleInFirstMeter += newPeople;
      if (queueLength == 0) queueLength = 1;
    }
  }
  
  coap_packet_t notification[1];
  char content[256];

  coap_init_message(notification, COAP_TYPE_NON, REST.status.OK, 0 );  
  coap_set_payload(
    notification, 
    content, 
    snprintf(
      content, 
      sizeof(content), 
      "{\"bn\":\"martiri\",\"e\":[{\"n\":\"queue\",\"id\":\"%u\",\"v\":\"%u\"}]}", 
      id, queueLength
    )
  );
  
  printf("People in first meter: %u\n", peopleInFirstMeter); 
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
    int length = sprintf(buff, "{\"bn\":\"martiri\",\"e\":[{\"n\":\"queue\",\"id\":\"%u\",\"bv\":\"%u\"}]}", id, queueLength);
    memcpy(buffer, buff, length);

    REST.set_header_content_type(response, REST.type.APPLICATION_JSON);
    REST.set_header_etag(response, (uint8_t*)&length, 1);
    REST.set_response_payload(response, buffer, length);
  } 
}

PROCESS_THREAD(server, ev, data)
{
  PROCESS_BEGIN();
  random_init(*(uint16_t*)(&rimeaddr_node_addr)*3);
  
  id = random_rand() % 200;
  queueLength = random_rand() % 5 + 1;
  
  rest_init_engine();
  rest_activate_periodic_resource(&periodic_resource_GetStatus);

  while(1)
  {
    PROCESS_WAIT_EVENT();
    /* TODO: function that check the seat */
  }

  PROCESS_END();
}
