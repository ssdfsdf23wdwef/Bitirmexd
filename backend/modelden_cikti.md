# AI Model Yanıtı

Tarih: 2025-06-10T02:00:25.113Z
Trace ID: quiz-1749520809687-a3sjp
Yanıt Uzunluğu: 8755 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "KVM hypervisor kurulumu için gerekli olan paketlerden hangisi, sanal makinelerin grafik arayüz üzerinden yönetilmesini sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "qemu-kvm",
        "virt-manager",
        "libvirt-daemon-system",
        "virtinst"
      ],
      "correctAnswer": "virt-manager",
      "explanation": "virt-manager paketi, KVM üzerinde sanal makinelerin grafik arayüz üzerinden yönetilmesini sağlayan araçtır. Diğer seçenekler ise KVM'nin temel bileşenleri, servisleri ve sanal makine oluşturma araçlarıdır. Bkz: Kvm kurulumu",
      "subTopicName": "Kvm Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_hypervisor_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdakilerden hangisi KVM kurulumu sırasında libvirtd servisinin başlatılması ve otomatik olarak başlaması için kullanılan komutlardan biridir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt install libvirtd",
        "sudo systemctl start libvirtd",
        "sudo systemctl enable --now libvirtd",
        "sudo usermod -aG libvirt $USER"
      ],
      "correctAnswer": "sudo systemctl enable --now libvirtd",
      "explanation": "sudo systemctl enable --now libvirtd komutu, libvirtd servisinin hem başlatılmasını hem de sistem açılışında otomatik olarak başlamasını sağlar. Bkz: Kvm kurulumu",
      "subTopicName": "Kvm Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_hypervisor_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "KVM kurulumu için gerekli paketlerin kurulumunda kullanılan 'apt' komutu hangi amaçla kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sistemdeki mevcut paketleri güncellemek",
        "Yeni paketleri kurmak, güncellemek veya kaldırmak",
        "Sistemdeki servisleri başlatmak veya durdurmak",
        "Kullanıcı izinlerini düzenlemek"
      ],
      "correctAnswer": "Yeni paketleri kurmak, güncellemek veya kaldırmak",
      "explanation": "apt komutu, Debian tabanlı sistemlerde (Ubuntu gibi) paket yönetimini sağlamak için kullanılır. Bu komut ile yeni paketler kurulabilir, mevcut paketler güncellenebilir veya sistemden kaldırılabilir. Bkz: Kvm kurulumu",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "KVM kurulumu için gerekli paketlerin kurulumunda aşağıdaki komutlardan hangisi KVM ve ilgili araçları kurmak için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt update",
        "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
        "sudo systemctl enable --now libvirtd",
        "sudo usermod -aG kvm $USER"
      ],
      "correctAnswer": "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
      "explanation": "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils komutu, KVM hypervisor'ı ve sanal makine yönetimi için gerekli olan tüm paketleri kurar. Bkz: Kvm kurulumu",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q5",
      "questionText": "/etc/libvirt/qemu.conf dosyasında yapılan değişikliklerin etkili olabilmesi için hangi komutun çalıştırılması gereklidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt update",
        "sudo reboot",
        "sudo systemctl restart libvirtd.service",
        "sudo virt-manager"
      ],
      "correctAnswer": "sudo systemctl restart libvirtd.service",
      "explanation": "/etc/libvirt/qemu.conf dosyasında yapılan değişikliklerin uygulanabilmesi için libvirtd servisinin yeniden başlatılması gerekmektedir. Bu işlem 'sudo systemctl restart libvirtd.service' komutu ile yapılır. Bkz: Kvm kurulumu",
      "subTopicName": "Libvirt Servisinin Yapılandırılması",
      "normalizedSubTopicName": "libvirt_servisinin_yapilandirilmasi",
      "difficulty": "medium"
    },
    {
      "id": "q6",
      "questionText": "libvirt yapılandırma dosyasında (qemu.conf) hangi satırların düzenlenmesi, kullanıcı ve grup ayarlarının yapılandırılması için gereklidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "#user ve #group",
        "#listen_tls ve #listen_tcp",
        "#dynamic_ownership ve #remember_owner",
        "#log_level ve #log_outputs"
      ],
      "correctAnswer": "#user ve #group",
      "explanation": "/etc/libvirt/qemu.conf dosyasında '#user' ve '#group' satırlarının başındaki '#' işaretini kaldırarak ilgili kullanıcı ve grup ayarları yapılandırılır. Bu, sanal makinelerin doğru izinlerle çalışmasını sağlar. Bkz: Kvm kurulumu",
      "subTopicName": "Libvirt Servisinin Yapılandırılması",
      "normalizedSubTopicName": "libvirt_servisinin_yapilandirilmasi",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "Virt-install komutunda kullanılan '--cdrom' parametresi neyi ifade eder?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makineye ayrılacak RAM miktarını",
        "Sanal makine için kullanılacak disk imajının yolunu",
        "Sanal makineye yüklenecek işletim sistemi ISO dosyasının yolunu",
        "Sanal makineye atanacak işlemci sayısını"
      ],
      "correctAnswer": "Sanal makineye yüklenecek işletim sistemi ISO dosyasının yolunu",
      "explanation": "'--cdrom' parametresi, sanal makine kurulumu sırasında kullanılacak olan işletim sistemi ISO dosyasının yolunu belirtir. Bu, sanal makinenin kurulum kaynağını tanımlar. Bkz: VM kurulumu",
      "subTopicName": "Virt İnstallıkomutu İle Vm Oluşturma",
      "normalizedSubTopicName": "virt_installikomutu_ile_vm_olusturma",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "Aşağıdaki virt-install komut parametrelerinden hangisi, oluşturulacak sanal makinenin disk boyutunu belirtir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "--name",
        "--ram",
        "--disk",
        "--vcpu"
      ],
      "correctAnswer": "--disk",
      "explanation": "--disk parametresi, sanal makineye ayrılacak disk alanı ile ilgili ayarları içerir. Bu parametre ile diskin yolu ve boyutu belirlenebilir. Bkz: VM kurulumu",
      "subTopicName": "Virt İnstallıkomutu İle Vm Oluşturma",
      "normalizedSubTopicName": "virt_installikomutu_ile_vm_olusturma",
      "difficulty": "easy"
    },
    {
      "id": "q9",
      "questionText": "Virsh komut satırı aracında, çalışır durumdaki sanal makineleri listelemek için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "virsh list",
        "virsh start",
        "virsh shutdown",
        "virsh reboot"
      ],
      "correctAnswer": "virsh list",
      "explanation": "virsh list komutu, sadece çalışır durumda olan sanal makineleri listeler. virsh list --all komutu ise tüm sanal makineleri (çalışan ve kapalı olanlar dahil) listeler. Bkz: Sanal Makinelerin Yönetilmesi",
      "subTopicName": "Virsh Komutları İle Vm Yönetimi",
      "normalizedSubTopicName": "virsh_komutlari_ile_vm_yonetimi",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Bir sanal makineyi kapatmak için kullanılan 'virsh shutdown VM_ADI' komutu, sanal makineyi hangi duruma getirir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Askıda (Suspended)",
        "Çalışır (Running)",
        "Kapalı (Shut-down)",
        "Yeniden Başlatılıyor (Rebooting)"
      ],
      "correctAnswer": "Kapalı (Shut-down)",
      "explanation": "virsh shutdown komutu, belirtilen sanal makineyi güvenli bir şekilde kapatır ve 'Shut-down' durumuna getirir. Bu, sanal makinenin işletim sistemi içinden kapatılması gibidir. Bkz: Sanal Makinelerin Yönetilmesi",
      "subTopicName": "Virsh Komutları İle Vm Yönetimi",
      "normalizedSubTopicName": "virsh_komutlari_ile_vm_yonetimi",
      "difficulty": "medium"
    }
  ]
}
```
```
