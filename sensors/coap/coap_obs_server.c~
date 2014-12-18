#include "contiki.h"
#include "contiki-net.h"
#include "erbium.h"
#include "er-coap-13.h"
#include "dev/leds.h"
#include "dev/button-sensor.h"
#include <stdio.h>
#include <string.h>


EVENT_RESOURCE(Resource1, METHOD_GET | METHOD_POST, "button", "title=\"Button\";obs");
PERIODIC_RESOURCE(Resource2, METHOD_GET, "notification", "title=\"Notification\";obs", 10*CLOCK_SECOND);

uint8_t obs_counter = 0;
uint8_t event_counter = 0;

PROCESS(server, "CoAP Server Process");
AUTOSTART_PROCESSES(&server);

void Resource1_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  int len = 20;
  const char *value;
  value = "200OK";
  memcpy(buffer, value, len);
  int length = len;
  
  REST.set_header_content_type(response, REST.type.TEXT_PLAIN);
  REST.set_header_etag(response, (uint8_t*)&length, 1);
  REST.set_response_payload(response, buffer, length);

}

void Resource1_event_handler(resource_t *r)
{
  coap_packet_t notification[1];
  char content[256];
  
  coap_init_message(notification, COAP_TYPE_CON, REST.status.OK, 0);

  coap_set_payload(notification, content, snprintf(content, sizeof(content), "<Sensor><Button><Pression>%u</Pression></Button></Sensor>", event_counter));
  
  REST.set_header_content_type(notification, REST.type.APPLICATION_XML);
  REST.notify_subscribers(r, event_counter, notification);
 
  printf("Button pression # %u\n", event_counter);
  event_counter ++;

}

void Resource2_handler(void *request, void *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset)
{
  
}

void Resource2_periodic_handler(resource_t *r)
{
  coap_packet_t notification[1];
  char content[256];
  if((obs_counter % 10) == 0) {
    coap_init_message(notification, COAP_TYPE_CON, REST.status.OK, 0 ); 
  } else {
    coap_init_message(notification, COAP_TYPE_NON, REST.status.OK, 0 );
  }    
  coap_set_payload(notification, content, snprintf(content, sizeof(content), "<Sensor><Tick>%u</Tick></Sensor>", obs_counter));
    REST.set_header_content_type(notification, REST.type.APPLICATION_XML);
  REST.notify_subscribers(r, obs_counter, notification);
  printf("TICK %u\n", obs_counter);
  obs_counter ++;
}

PROCESS_THREAD(server, ev, data)
{
  PROCESS_BEGIN();
  SENSORS_ACTIVATE(button_sensor);
  rest_init_engine();
  rest_activate_event_resource(&resource_Resource1);
  rest_activate_periodic_resource(&periodic_resource_Resource2);
  
  while(1)
  {
    PROCESS_WAIT_EVENT();
    if (ev == sensors_event && data == &button_sensor) {
      Resource1_event_handler(&resource_Resource1); 
    }
  }

  PROCESS_END();
}